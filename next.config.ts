import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    // Previne clickjacking
                    { key: 'X-Frame-Options', value: 'DENY' },
                    // Previne sniffing de MIME type
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    // Força HTTPS por 1 ano
                    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
                    // Controla informação de referrer
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    // Desactiva funcionalidades perigosas do browser
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                ],
            },
        ];
    },
    // Limitar tamanho de uploads
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
    },
};

export default nextConfig;
