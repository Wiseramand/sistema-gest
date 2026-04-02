import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

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
    },
    {
        callbacks: {
            // Return true to always run the middleware function below it,
            // which handles the path-specific authentication and redirection.
            authorized: () => true,
        },
    }
);

// Aplicar middleware a estas rotas
export const config = {
    matcher: ['/admin/:path*', '/student/:path*', '/professor/:path*'],
};
