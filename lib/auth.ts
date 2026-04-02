import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import bcrypt from "bcryptjs"
import { checkRateLimit } from "./rateLimit"

export const getAuthOptions = (portal: string = 'default'): NextAuthOptions => ({
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
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
                    // Try email first
                    let user = await (db as any)[col].findUnique({ where: { email: identifier } });

                    // Try username if not found
                    if (!user) {
                        user = await (db as any)[col].findUnique({ where: { username: identifier } });
                    }

                    if (user) {
                        foundUser = user;
                        foundPasswordHash = user.passwordHash;
                        break;
                    }
                }

                if (!foundUser || !foundPasswordHash) {
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
                    responsibilities: (foundUser as any).responsibilities || [],
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role
                token.id = user.id
                token.responsibilities = (user as any).responsibilities
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).responsibilities = token.responsibilities;
            }
            return session
        },
    },
});

export const authOptions = getAuthOptions();
