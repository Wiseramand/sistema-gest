import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './components/ClientLayout';

export const metadata: Metadata = {
    title: 'Marítimo Training Center — Formação Marítima em Angola',
    description: 'Centro de excelência em formação marítima em Luanda, Angola. Cursos certificados internacionalmente para profissionais do setor marítimo.',
    openGraph: {
        title: 'Marítimo Training Center',
        description: 'Formação marítima certificada internacionalmente.',
        locale: 'pt_AO',
        type: 'website',
    },
    icons: {
        icon: '/icon.svg',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang='pt-AO'>
            <head>
                <link rel='icon' href='/icon.svg' type='image/svg+xml' />
                <link rel='preconnect' href='https://fonts.googleapis.com' />
                <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
                <link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap' rel='stylesheet' />
            </head>
            <body>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
