import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export default async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // Determine the base cookie name based on the path
    let baseCookieName = 'next-auth.session-token';
    if (path.startsWith('/admin')) baseCookieName = 'next-auth.session-token.admin';
    else if (path.startsWith('/professor')) baseCookieName = 'next-auth.session-token.professor';
    else if (path.startsWith('/student')) baseCookieName = 'next-auth.session-token.student';

    // Try both standard and Secure/Host prefixed cookies (production vs dev)
    const possibleCookieNames = [
        baseCookieName,
        `__Secure-${baseCookieName}`,
        `__Host-${baseCookieName}`
    ];

    let token = null;
    for (const cookieName of possibleCookieNames) {
        token = await getToken({ 
            req, 
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: cookieName
        });
        if (token) break;
    }

    // Proteger rotas de admin — só ADMIN ou SUPER_ADMIN
    if (path.startsWith('/admin') && path !== '/admin/login') {
        if (!token || (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN')) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }
    }

    // Proteger rotas de alunos
    if (path.startsWith('/student') && path !== '/student/login') {
        if (!token || token.role !== 'STUDENT') {
            return NextResponse.redirect(new URL('/student/login', req.url));
        }
    }

    // Proteger rotas de professores
    if (path.startsWith('/professor') && path !== '/professor/login') {
        if (!token || token.role !== 'TRAINER') {
            return NextResponse.redirect(new URL('/professor/login', req.url));
        }
    }

    return NextResponse.next();
}

// Aplicar a todas as rotas EXCETO ficheiros estáticos e páginas de login
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|admin/login|student/login|professor/login|login).*)'
    ],
};
