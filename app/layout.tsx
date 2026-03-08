'use client';

import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LoadingOverlay from './components/LoadingOverlay';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loader on page change and initial load
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <html lang="pt-br">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SessionProvider>
          {isLoading && <LoadingOverlay />}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
