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

    return (
        <SessionProvider>
            {isLoading && <LoadingOverlay />}
            {children}
        </SessionProvider>
    );
}
