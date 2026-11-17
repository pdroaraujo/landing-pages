import { cidades } from '@/lib/cidades';
import { faqItems } from '@/lib/faq';
import { site } from '@/lib/site-config';

export const businessId = `${site.url}/#business`;

export function JsonLd({ data }: { data: object }) {
    // JSON.stringify não escapa "<"; troca para não fechar a tag <script> por acidente.
    const json = JSON.stringify(data).replace(/</g, '\\u003c');
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export const businessSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': businessId,
    name: site.name,
    alternateName: 'PH Container - Locação de Container e Munck',
    description:
        'Locação, compra e venda de containers e locação de caminhão Munck (guindauto) em Jacareí, São José dos Campos e todo o Vale do Paraíba. Em operação desde 1995.',
    slogan: 'Solução em locação de containers e guindautos no Vale do Paraíba',
    url: `${site.url}/`,
    logo: `${site.url}/logo.webp`,
    image: `${site.url}/fotos/hero-munck-container.jpg`,
    telephone: '+55-12-99724-8156',
    email: site.email,
    foundingDate: String(site.since),
    priceRange: '$$',
    currenciesAccepted: 'BRL',
    paymentAccepted: 'Dinheiro, PIX, Boleto bancário, Cartão',
    address: {
        '@type': 'PostalAddress',
        streetAddress: site.address.street,
        addressLocality: site.address.city,
        addressRegion: site.address.state,
        postalCode: site.address.zip,
        addressCountry: 'BR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    // TODO confirmar horário real com a PH.
    openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '07:30', closes: '17:30' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '08:00', closes: '12:00' },
    ],
    knowsLanguage: 'pt-BR',
    sameAs: [site.instagram],
    areaServed: [...cidades]
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))
        .map((c) => ({ '@type': 'City', name: c.nome })),
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Serviços PH Container',
        itemListElement: [
            ['Locação de container escritório', 'Container escritório com ar-condicionado, janelas e instalação elétrica. Módulos de 6 m e 12 m.'],
            ['Locação de container depósito e almoxarifado', 'Container para armazenagem de materiais e ferramentas em obra ou indústria.'],
            ['Locação de container banheiro e vestiário', 'Container sanitário para canteiro de obra, com vasos, chuveiros e lavatórios.'],
            ['Locação de caminhão Munck (guindauto)', 'Guindauto para carga, descarga, remoção de máquinas e transporte de cargas no Vale do Paraíba.'],
            ['Içamento de cargas', 'Içamento de painéis, totens e estruturas, inclusive com cesto de inspeção veicular.'],
        ].map(([name, description]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name, description } })),
    },
});

export const faqSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
});

export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Início', path: '/' }, ...items].map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        item: `${site.url}${it.path}`,
    })),
});
