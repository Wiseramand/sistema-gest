'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LoadingOverlay from './LoadingOverlay';
import { SessionProvider } from 'next-auth/react';
import Chatbot from './Chatbot';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handle = requestAnimationFrame(() => setIsLoading(true));
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => {
            cancelAnimationFrame(handle);
            clearTimeout(timer);
        };
    }, [pathname]);

    const getBasePath = () => {
        if (pathname.startsWith('/admin')) return '/api/auth/admin';
        if (pathname.startsWith('/professor')) return '/api/auth/professor';
        if (pathname.startsWith('/student')) return '/api/auth/student';
        return '/api/auth';
    };

    return (
        <SessionProvider basePath={getBasePath()}>
            {isLoading && <LoadingOverlay />}
            {children}
            {!pathname.startsWith('/admin') && !pathname.startsWith('/professor') && <Chatbot />}
        </SessionProvider>
    );
}
