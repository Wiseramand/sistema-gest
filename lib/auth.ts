import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import bcrypt from "bcryptjs"
import { checkRateLimit } from "./rateLimit"

export const getAuthOptions = (portal: string = 'default'): NextAuthOptions => {
    const isDefault = portal === 'default';
    const cookieName = 'next-auth.session-token';

    return {
        session: {
            strategy: "jwt",
            maxAge: 30 * 24 * 60 * 60, // 30 days
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
                    secure: true, // Force secure since we are on HTTPS
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
                    const identifier = credentials?.email?.trim(); 
                    const password = credentials?.password;

                    if (!identifier || !password) {
                        throw new Error("Identificador e senha são obrigatórios")
                    }

                    // const { allowed, retryAfter } = checkRateLimit(`login:${identifier}`);
                    // if (!allowed) {
                    //     throw new Error(`Demasiadas tentativas. Aguarde ${retryAfter} segundos.`);
                    // }

                    console.log(`[AUTH] Login: ${identifier} em ${portal}`);

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

                    for (const col of collections) {
                        try {
                            const model = (db as any)[col];
                            if (!model) continue;

                            console.log(`[AUTH] Procurando em ${col} por "${identifier}" (case-insensitive)...`);
                            const user = await model.findFirst({
                                where: {
                                    OR: [
                                        { email: identifier },
                                        { username: identifier },
                                        { email: identifier.toLowerCase() },
                                        { username: identifier.toLowerCase() }
                                    ]
                                }
                            });

                            if (user) {
                                // Suportar tanto 'password' como 'passwordHash'
                                const hash = user.passwordHash || user.password;
                                
                                if (!hash) {
                                    console.error(`[AUTH] Utilizador ${identifier} encontrado em ${col} mas sem senha definida.`);
                                    continue;
                                }

                                const isValid = await bcrypt.compare(password, hash);

                                if (isValid) {
                                    console.log(`[AUTH] Sucesso: ${identifier} (${col})`);
                                    return {
                                        id: user.id,
                                        email: user.email,
                                        name: user.name,
                                        role: user.role,
                                        photo: (user as any).photo || null,
                                        responsibilities: (user as any).responsibilities || [],
                                    };
                                } else {
                                    console.log(`[AUTH] Senha incorreta para ${identifier} em ${col}`);
                                }
                            } else {
                                console.log(`[AUTH] Não encontrado em ${col}.`);
                            }
                        } catch (err: any) {
                            console.error(`[AUTH] Erro em ${col}:`, err.message);
                        }
                    }

                    throw new Error("Utilizador não encontrado ou palavra-passe incorreta");
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
    const options = getAuthOptions();
    
    // Possíveis nomes de cookies em produção/HTTPS
    const possibleNames = [
        'next-auth.session-token',
        '__Secure-next-auth.session-token',
        '__Host-next-auth.session-token'
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
    return null;
}
