import { CheckCircleIcon } from '@solar-icons/react/bold/check-circle';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd, breadcrumbSchema, businessId } from '@/components/json-ld';
import { StatRow, Subpage, defaultStats } from '@/components/subpage';
import {
    cidadeBySlug,
    cidadePath,
    cidades,
    limpaTraco,
    prazoCurto,
    prazoLongo,
    regiaoTexto,
    vizinhas,
} from '@/lib/cidades';
import { externalLink, site, whatsappFor } from '@/lib/site-config';

// URLs mantidas do site anterior: /container-em-<slug>/ (o SEO local depende delas).
const PREFIX = 'container-em-';

export const dynamicParams = false;

export function generateStaticParams() {
    return cidades.map((c) => ({ cidade: `${PREFIX}${c.slug}` }));
}

type Props = { params: Promise<{ cidade: string }> };

async function getCidade(params: Props['params']) {
    const { cidade } = await params;
    if (!cidade.startsWith(PREFIX)) return undefined;
    return cidadeBySlug(cidade.slice(PREFIX.length));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const c = await getCidade(params);
    if (!c) return {};
    const title = `Locação de Container em ${c.nome} | PH Container`;
    const description = `Aluguel de container escritório, almoxarifado e sanitário e caminhão Munck em ${c.nome} e região. PH Container: mais de 30 anos no Vale do Paraíba. Peça orçamento pelo WhatsApp.`;
    return {
        title,
        description,
        alternates: { canonical: cidadePath(c) },
        openGraph: { title, description, url: cidadePath(c) },
    };
}

export default async function CidadePage({ params }: Props) {
    const c = await getCidade(params);
    if (!c) notFound();

    const url = `${site.url}${cidadePath(c)}`;
    const wa = whatsappFor(`container em ${c.nome}`);
    const faq = [
        [`A PH Container entrega container em ${c.nome}?`, `Sim. ${c.nome} faz parte da área de atendimento da PH Container. A entrega e a retirada são feitas com frota própria de caminhão Munck, a partir da sede em Jacareí.`],
        [`Quanto custa alugar um container em ${c.nome}?`, `O valor depende do tipo de container, do tempo de locação e do endereço de entrega em ${c.nome}. O orçamento é gratuito e sem compromisso pelo WhatsApp ${site.phone}.`],
        [`Qual o prazo para entregar em ${c.nome}?`, `Em média ${prazoCurto(c)} úteis após a confirmação do orçamento, conforme a disponibilidade do modelo escolhido.`],
        [`Preciso preparar o terreno em ${c.nome}?`, 'O local deve estar nivelado e com acesso livre para o caminhão Munck posicionar o container. A equipe orienta sobre o ponto de instalação antes da entrega.'],
        ['A PH aluga só o container ou também o Munck?', 'Os dois. Você pode alugar apenas o container, apenas o caminhão Munck para transporte e içamento, ou os dois juntos.'],
    ];

    return (
        <Subpage
            crumbs={[{ name: 'Cidades', href: '/cidades/' }, { name: c.nome }]}
            chip={`PH Container atende ${c.nome}`}
            title={`Locação de container em ${c.nome}`}
            lead={`Container escritório, almoxarifado, banheiro e refeitório, além de caminhão Munck, com entrega em ${c.nome} e região. Mais de 30 anos de Vale do Paraíba, com frota própria.`}
            secondaryAction={{ label: 'Ver a PH no mapa', href: site.mapsUrl, external: true }}
        >
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'Service',
                    serviceType: 'Locação de container e caminhão Munck',
                    provider: { '@id': businessId },
                    areaServed: { '@type': 'City', name: c.nome, containedInPlace: { '@type': 'AdministrativeArea', name: 'Vale do Paraíba, SP' } },
                    url,
                    name: `Locação de Container em ${c.nome}`,
                }}
            />
            <JsonLd data={breadcrumbSchema([{ name: 'Cidades', path: '/cidades/' }, { name: `Container em ${c.nome}`, path: cidadePath(c) }])} />
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
                }}
            />

            <div className="sp-wrap">
                <StatRow items={defaultStats({ n: prazoCurto(c), l: `Prazo médio de entrega em ${c.nome}` })} />
            </div>

            <section className="sp-section">
                <div className="sp-wrap sp-split">
                    <div className="sp-prose" data-scroll-reveal data-reveal="left">
                        <h2>Aluguel de container em {c.nome}</h2>
                        <p>
                            A PH Container atende {c.nome}, {regiaoTexto[c.regiao]}, com locação de containers e
                            caminhão Munck para obras, indústrias, comércio e eventos. A operação começou em {site.since}, a
                            partir de Jacareí, e a entrega e a retirada são feitas com frota própria de guindautos.
                        </p>
                        <p className="sp-muted">{limpaTraco(c.nota)}</p>
                        <p>
                            Depois de confirmar o orçamento, a entrega em {c.nome} leva {prazoLongo(c)}, conforme o
                            modelo disponível. O local precisa estar nivelado e com acesso livre para o caminhão
                            posicionar o container.
                        </p>
                        <ul className="sp-checks">
                            <li><CheckCircleIcon aria-hidden="true" />Frota própria de Munck, sem terceirizar o guindauto</li>
                            <li><CheckCircleIcon aria-hidden="true" />Containers de 6 e 12 metros, combináveis conforme o projeto</li>
                            <li><CheckCircleIcon aria-hidden="true" />Orçamento no mesmo dia pelo WhatsApp {site.phone}</li>
                            <li><CheckCircleIcon aria-hidden="true" />Contratos por diária, mensais ou por período de obra</li>
                        </ul>
                    </div>
                    <div className="sp-services" data-scroll-reveal data-reveal="right" data-reveal-delay="1">
                        <h2>O que a PH entrega em {c.nome}</h2>
                        <div className="sp-service">
                            <h3>Locação de containers</h3>
                            <ul>
                                <li>Escritório com ar-condicionado e instalação elétrica</li>
                                <li>Depósito e almoxarifado</li>
                                <li>Banheiro e vestiário para canteiro de obra</li>
                                <li>Plantão de vendas e refeitório</li>
                                <li>Módulos de 6 metros (20 pés) e 12 metros (40 pés)</li>
                            </ul>
                        </div>
                        <div className="sp-service sp-service--dark">
                            <h3>Caminhão Munck e içamento</h3>
                            <ul>
                                <li>Transporte de cargas em geral</li>
                                <li>Operações de carga e descarga</li>
                                <li>Remoção e mudança de máquinas</li>
                                <li>Içamento de painéis, totens e estruturas</li>
                                <li>Içamento com cesto de inspeção veicular</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="sp-section sp-section--mist">
                <div className="sp-wrap">
                    <h2 className="sp-center-h" data-scroll-reveal data-reveal="up">Perguntas frequentes sobre container em {c.nome}</h2>
                    <div className="sp-faq" data-scroll-reveal data-reveal="up">
                        {faq.map(([q, a]) => (
                            <details key={q}>
                                <summary>{q}</summary>
                                <p>{a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <section className="sp-section">
                <div className="sp-wrap">
                    <h2 className="sp-center-h" data-scroll-reveal data-reveal="up">De onde a PH Container atende {c.nome}</h2>
                    <div className="sp-map" data-scroll-reveal data-reveal="up">
                        <iframe
                            src="https://www.google.com/maps?q=PH+Container+Jacarei&output=embed"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Mapa: PH Container em Jacareí"
                        />
                        <div className="sp-addr">
                            <h3>{site.name}</h3>
                            <p>{site.address.street}<br />{site.address.district}, {site.address.city} - {site.address.state}<br />{site.address.zip}</p>
                            <p><a href={`tel:+${site.whatsapp}`}>{site.phone}</a><br /><a href={`mailto:${site.email}`}>{site.email}</a></p>
                            <p><a href={site.mapsUrl} {...externalLink}>Abrir no Google Maps</a></p>
                        </div>
                    </div>
                    <p className="sp-clients">
                        Empresas como <strong>Ambev, Cebrace, Heineken, Nestlé, Suzano</strong> e a <strong>Prefeitura de Jacareí</strong> já contrataram a PH Container no Vale do Paraíba.
                    </p>
                </div>
            </section>

            <section className="sp-section sp-section--mist">
                <div className="sp-wrap">
                    <div className="sp-cta" data-scroll-reveal data-reveal="up">
                        <div>
                            <h2>Precisa de um container em {c.nome}?</h2>
                            <p>Fale com a PH Container e receba o orçamento hoje mesmo, sem compromisso.</p>
                        </div>
                        <a className="sp-btn sp-btn--primary" href={wa} {...externalLink}>Pedir orçamento</a>
                    </div>
                    <h2 className="sp-near-title">A PH Container também atende perto de {c.nome}</h2>
                    <ul className="sp-near">
                        {vizinhas(c).map((v) => (
                            <li key={v.slug}><a href={cidadePath(v)}>Container em {v.nome}</a></li>
                        ))}
                        <li><a className="sp-near__all" href="/cidades/">Ver todas as cidades</a></li>
                    </ul>
                </div>
            </section>
        </Subpage>
    );
}
