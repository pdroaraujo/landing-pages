import type { Metadata } from 'next';
import { JsonLd, breadcrumbSchema, businessId } from '@/components/json-ld';
import { StatRow, Subpage, defaultStats } from '@/components/subpage';
import { cidades } from '@/lib/cidades';
import { externalLink, fullAddress, photos, site, whatsappUrl } from '@/lib/site-config';

const title = 'Sobre a PH Container | 30 anos de locação de containers no Vale do Paraíba';
const description =
    'A PH Container aluga, compra e vende containers e aluga caminhão Munck desde 1995, com sede em Jacareí e frota própria. Atende 39 cidades do Vale do Paraíba, Mantiqueira e Litoral Norte.';

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: '/sobre/' },
    openGraph: { title, description, url: '/sobre/' },
};

export default function SobrePage() {
    const nomes = [...cidades].map((c) => c.nome).sort((a, b) => a.localeCompare(b, 'pt'));
    return (
        <Subpage
            crumbs={[{ name: 'Sobre' }]}
            title="Locação de containers no Vale do Paraíba desde 1995"
            lead="Mais de 30 anos entregando container escritório, almoxarifado e sanitário, além de caminhão Munck, para obras e indústrias de Jacareí a Ubatuba."
            image={photos.container}
            secondaryAction={{ label: 'Ver cidades atendidas', href: '/cidades/' }}
        >
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'AboutPage',
                    url: `${site.url}/sobre/`,
                    name: 'Sobre a PH Container',
                    about: { '@id': businessId },
                    primaryImageOfPage: `${site.url}/bg-container.webp`,
                    inLanguage: 'pt-BR',
                }}
            />
            <JsonLd data={breadcrumbSchema([{ name: 'Sobre', path: '/sobre/' }])} />

            <div className="sp-wrap">
                <StatRow items={defaultStats()} />
            </div>

            <section className="sp-section">
                <div className="sp-wrap sp-prose" data-scroll-reveal data-reveal="up">
                    <h2>Quem é a PH Container</h2>
                    <p>
                        A PH Container é uma empresa de locação, compra e venda de containers e locação de
                        caminhão Munck (guindauto), com sede própria em Jacareí, São Paulo. Está em operação
                        desde {site.since}, mais de três décadas atendendo o Vale do Paraíba.
                    </p>
                    <p>
                        O trabalho vai do canteiro de obra à indústria: container escritório com ar-condicionado,
                        container depósito e almoxarifado, container banheiro e vestiário, além de transporte,
                        carga, descarga e içamento de cargas com guindauto.
                    </p>

                    <h2>Frota e operação</h2>
                    <p>
                        A entrega e a retirada dos containers são feitas com <strong>frota própria de caminhões Munck</strong>.
                        A PH não terceiriza o guindauto, o que dá mais controle de prazo e mais segurança na
                        colocação do container no local.
                    </p>
                    <p>
                        Os módulos têm <strong>6 metros (20 pés) ou 12 metros (40 pés)</strong>, e podem ser combinados
                        ou sobrepostos conforme o projeto.
                    </p>

                    <h2>Clientes</h2>
                    <p>Empresas e órgãos públicos que já contrataram a PH Container:</p>
                    <ul className="sp-pills">
                        {['Ambev', 'Cebrace', 'Heineken', 'Nestlé', 'Prefeitura de Jacareí', 'SAAE', 'Suzano Celulose'].map((c) => (
                            <li key={c}>{c}</li>
                        ))}
                    </ul>

                    <h2>Onde a PH Container atende</h2>
                    <p>
                        A cobertura vai por todo o Vale do Paraíba, a Serra da Mantiqueira e o Litoral Norte de
                        São Paulo, ao todo {cidades.length} cidades. Veja a <a href="/cidades/">lista completa de cidades
                        atendidas</a>, cada uma com sua página.
                    </p>
                    <p className="sp-muted">{nomes.slice(0, -1).join(', ')} e {nomes.at(-1)}.</p>

                    <h2>Contato</h2>
                    <ul className="sp-contact">
                        <li><strong>WhatsApp e telefone:</strong> <a href={whatsappUrl} {...externalLink}>{site.phone}</a></li>
                        <li><strong>E-mail:</strong> <a href={`mailto:${site.email}`}>{site.email}</a></li>
                        <li><strong>Endereço:</strong> <a href={site.mapsUrl} {...externalLink}>{fullAddress}</a></li>
                        <li><strong>Instagram:</strong> <a href={site.instagram} {...externalLink}>{site.instagramHandle}</a></li>
                    </ul>
                </div>
            </section>
        </Subpage>
    );
}
