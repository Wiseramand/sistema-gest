'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import Chatbot from './Chatbot';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const getBasePath = () => {
        if (pathname.startsWith('/admin')) return '/api/auth/admin';
        if (pathname.startsWith('/professor')) return '/api/auth/professor';
        if (pathname.startsWith('/student')) return '/api/auth/student';
        return '/api/auth';
    };

    return (
        <SessionProvider basePath={getBasePath()}>
            {children}
            {!pathname.startsWith('/admin') && !pathname.startsWith('/professor') && <Chatbot />}
        </SessionProvider>
    );
}
