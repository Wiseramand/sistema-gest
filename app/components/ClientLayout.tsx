'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LoadingOverlay from './LoadingOverlay';
import { SessionProvider } from 'next-auth/react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
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
        </SessionProvider>
    );
}
