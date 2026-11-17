import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import './globals.css';
import './ph.css';
import './subpage.css';
import { SmoothScrollProvider } from '@/components/smooth-scroll-provider';
import Script from 'next/script';
import { site } from '@/lib/site-config';

const title = 'PH Container | Locação de Containers e Munck em Jacareí e Vale do Paraíba';
const description =
    'Locação, compra e venda de containers e caminhão Munck em Jacareí, São José dos Campos e todo o Vale do Paraíba. Container escritório, almoxarifado e sanitário. Desde 1995.';

export const metadata: Metadata = {
    metadataBase: new URL(site.url),
    title: { default: title, template: '%s' },
    description,
    applicationName: site.name,
    alternates: { canonical: '/' },
    icons: { icon: [{ url: '/favicon.png', type: 'image/png' }], apple: '/apple-touch-icon.png' },
    manifest: '/manifest.webmanifest',
    robots: { index: true, follow: true },
    formatDetection: { email: false, address: false, telephone: false },
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        siteName: site.name,
        title,
        description,
        url: '/',
        images: [{ url: '/fotos/hero-munck-container.jpg', width: 1920, height: 1080 }],
    },
};

export const viewport: Viewport = {
    themeColor: '#2b2b94',
    colorScheme: 'light',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-BR" className="site-motion-ready">
            <body>
                <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
                <SmoothScrollProvider>{children}</SmoothScrollProvider>
                {/* GA4 só carrega após o aceite; também mede cliques em WhatsApp/telefone/avaliação. */}
                <Script src="/cookie-consent.js" strategy="afterInteractive" />
            </body>
        </html>
    );
}
