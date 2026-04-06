import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import bcrypt from "bcryptjs"
import { checkRateLimit } from "./rateLimit"

export const getAuthOptions = (portal: string = 'default'): NextAuthOptions => {
    const isDefault = portal === 'default';
    const cookieName = isDefault ? 'next-auth.session-token' : `next-auth.session-token.${portal}`;

    return {
        session: {
            strategy: "jwt",
        },
        pages: {
            signIn: portal === 'admin' ? '/admin/login' : (portal === 'professor' ? '/professor/login' : '/login'),
        },
        cookies: {
            sessionToken: {
                name: cookieName,
                options: {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    secure: process.env.NODE_ENV === 'production',
                },
            },
        },
        providers: [
            CredentialsProvider({
                name: "credentials",
                credentials: {
                    email: { label: "Email", type: "email" },
                    password: { label: "Password", type: "password" },
                },
                async authorize(credentials) {
                    const identifier = credentials?.email; // This field might contain email OR username
                    if (!identifier || !credentials?.password) {
                        throw new Error("Dados de acesso inválidos")
                    }

                    const { allowed, retryAfter } = checkRateLimit(`login:${identifier}`);
                    if (!allowed) {
                        throw new Error(`Demasiadas tentativas de login. Aguarde ${retryAfter} segundos.`);
                    }

                    console.log(`[AUTH] Attempting login for identifier: ${identifier} on portal: ${portal}`);
                    // Collections to search based on portal
                    let collections: string[] = [];
                    if (portal === 'admin') {
                        collections = ['adminUser', 'user'];
                    } else if (portal === 'student') {
                        collections = ['student'];
                    } else if (portal === 'professor') {
                        collections = ['trainer'];
                    } else {
                        collections = ['user', 'adminUser', 'student', 'trainer'];
                    }

                    let foundUser = null;
                    let foundPasswordHash = null;

                    for (const col of collections) {
                        try {
                            // Try email first
                            let user = await (db as any)[col].findUnique({ where: { email: identifier } });

                            // Try username if not found
                            if (!user) {
                                user = await (db as any)[col].findUnique({ where: { username: identifier } });
                            }

                            if (user) {
                                console.log(`[AUTH] Found user in collection: ${col}`);
                                foundUser = user;
                                foundPasswordHash = user.passwordHash;
                                break;
                            }
                        } catch (err: any) {
                            console.error(`[AUTH] Error searching in collection ${col}:`, err.message);
                        }
                    }

                    if (!foundUser || !foundPasswordHash) {
                        console.log(`[AUTH] User not found or no password hash for: ${identifier}`);
                        throw new Error("Usuário não encontrado")
                    }

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        foundPasswordHash
                    )

                    if (!isPasswordCorrect) {
                        throw new Error("Senha incorreta")
                    }

                    return {
                        id: foundUser.id,
                        email: foundUser.email,
                        name: foundUser.name,
                        role: foundUser.role,
                        photo: (foundUser as any).photo || null,
                        responsibilities: (foundUser as any).responsibilities || [],
                    }
                },
            }),
        ],
        callbacks: {
            async jwt({ token, user, trigger, session }) {
                if (user) {
                    token.role = (user as any).role
                    token.id = user.id
                    token.photo = (user as any).photo
                    token.responsibilities = (user as any).responsibilities
                }
                // Allow manual session updates (if needed after profile edit)
                if (trigger === "update" && session?.photo) {
                    token.photo = session.photo;
                }
                return token
            },
            async session({ session, token }) {
                if (session.user) {
                    (session.user as any).role = token.role;
                    (session.user as any).id = token.id;
                    (session.user as any).photo = token.photo;
                    (session.user as any).responsibilities = token.responsibilities;
                }
                return session
            },
        },
    };
};

export const authOptions = getAuthOptions();

import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"

/**
 * Helper to get the session across any portal (default, admin, professor, student)
 * because each uses a different cookie name.
 */
export async function getAnySession() {
    const portals = ['admin', 'professor', 'student', 'default'];
    
    for (const p of portals) {
        const options = getAuthOptions(p);
        const baseCookieName = (options.cookies?.sessionToken as any)?.name || `next-auth.session-token${p === 'default' ? '' : '.' + p}`;
        
        // Check for common production prefixes
        const possibleNames = [
            baseCookieName,
            `__Secure-${baseCookieName}`,
            `__Host-${baseCookieName}`
        ];

        for (const name of possibleNames) {
            const session = await getServerSession({
                ...options,
                cookies: {
                    ...options.cookies,
                    sessionToken: {
                        ...(options.cookies?.sessionToken as any),
                        name: name
                    }
                }
            });
            if (session) return session;
        }
    }
    return null;
}
