import type { Metadata, Viewport } from 'next';
import '@fontsource/sora/400.css';
import '@fontsource/inter/400.css';
import './globals.css';
import { SmoothScrollProvider } from '@/components/smooth-scroll-provider';

export const metadata: Metadata = {
    title: 'Template Code Makers | Climatização',
    description: 'Template demonstrativo para sites de instalação e manutenção de ar-condicionado.',
    applicationName: 'Template Code Makers',
    icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
    manifest: '/manifest.webmanifest',
    robots: { index: false, follow: false },
    formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
    themeColor: '#1c397f',
    colorScheme: 'light',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-BR" className="site-motion-ready">
            <body><SmoothScrollProvider>{children}</SmoothScrollProvider></body>
        </html>
    );
}
