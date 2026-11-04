import type { Metadata, Viewport } from 'next';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import './globals.css';
import { SmoothScrollProvider } from '@/components/smooth-scroll-provider';
import { site } from '@/lib/site-config';

const title = `${site.name} | Hidráulica e Impermeabilização em ${site.city}`;
const description = `Atacado de hidráulica e impermeabilização para construtoras, engenheiros e arquitetos em ${site.city} e região. Amanco, Deca, Celite, Acqualimp e Bidim. Desde ${site.since}.`;

export const metadata: Metadata = {
    metadataBase: new URL(site.url),
    title,
    description,
    applicationName: site.name,
    keywords: [
        'hidráulica São José dos Campos',
        'impermeabilização São José dos Campos',
        'materiais de construção SJC',
        'tubos e conexões',
        'atacado construção civil Vale do Paraíba',
    ],
    alternates: { canonical: '/' },
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: site.url,
        siteName: site.fullName,
        title,
        description,
        images: [{ url: '/fotos/footer-panorama.jpg', width: 1983, height: 793, alt: site.fullName }],
    },
    icons: {
        icon: [
            { url: '/favicon.svg', type: 'image/svg+xml' },
            { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
        ],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    manifest: '/manifest.webmanifest',
    robots: { index: true, follow: true },
    formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
    themeColor: '#0b6b2d',
    colorScheme: 'light',
};

const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: site.fullName,
    legalName: site.legalName,
    url: site.url,
    telephone: `+55 ${site.phone}`,
    foundingDate: String(site.since),
    image: `${site.url}/fotos/footer-panorama.jpg`,
    sameAs: [site.instagram],
    areaServed: site.region,
    address: {
        '@type': 'PostalAddress',
        streetAddress: site.address.street,
        addressLocality: site.address.city,
        addressRegion: site.address.state,
        postalCode: site.address.zip,
        addressCountry: 'BR',
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-BR" className="site-motion-ready">
            <body>
                <script
                    type="application/ld+json"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
                />
                <SmoothScrollProvider>{children}</SmoothScrollProvider>
            </body>
        </html>
    );
}
