import type { Metadata } from 'next';
import { JsonLd, breadcrumbSchema, businessId } from '@/components/json-ld';
import { Subpage } from '@/components/subpage';
import { cidadePath, cidades, cidadesPorRegiao } from '@/lib/cidades';
import { externalLink, photos, site, whatsappUrl } from '@/lib/site-config';

const title = 'Cidades atendidas | Locação de container no Vale do Paraíba | PH Container';
const description = `A PH Container entrega container e caminhão Munck em ${cidades.length} cidades do Vale do Paraíba, da Serra da Mantiqueira e do Litoral Norte de São Paulo. Veja a lista completa.`;

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: '/cidades/' },
    openGraph: { title, description, url: '/cidades/' },
};

export default function CidadesPage() {
    return (
        <Subpage
            crumbs={[{ name: 'Cidades' }]}
            chip={`${cidades.length} cidades atendidas`}
            title="Cidades atendidas pela PH Container"
            lead="Locação de containers e caminhão Munck em todo o Vale do Paraíba, na Serra da Mantiqueira e no Litoral Norte de São Paulo. Escolha a sua cidade."
            image={photos.obra}
        >
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'CollectionPage',
                    name: 'Cidades atendidas pela PH Container',
                    about: { '@id': businessId },
                    url: `${site.url}/cidades/`,
                    inLanguage: 'pt-BR',
                }}
            />
            <JsonLd data={breadcrumbSchema([{ name: 'Cidades atendidas', path: '/cidades/' }])} />

            <section className="ph-cities ph-cities--hub">
                <div className="ph-cities__inner">
                    <div className="ph-cities__groups">
                        {cidadesPorRegiao.map((grupo) => (
                            <div className="ph-cities__group" key={grupo.regiao} data-scroll-reveal data-reveal="up">
                                <h2>{grupo.nome}<small>{grupo.cidades.length}</small></h2>
                                <ul>
                                    {grupo.cidades.map((c) => (
                                        <li key={c.slug}><a href={cidadePath(c)}>Container em {c.nome}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="sp-section sp-section--mist">
                <div className="sp-wrap">
                    <div className="sp-cta" data-scroll-reveal data-reveal="up">
                        <div>
                            <h2>Não achou a sua cidade?</h2>
                            <p>A PH Container atende toda a região. Fale com a gente e confirme a entrega no seu endereço.</p>
                        </div>
                        <a className="sp-btn sp-btn--primary" href={whatsappUrl} {...externalLink}>Falar no WhatsApp</a>
                    </div>
                </div>
            </section>
        </Subpage>
    );
}
