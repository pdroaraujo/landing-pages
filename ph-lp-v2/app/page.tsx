import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import { ArrowRightUpIcon as ArrowRightUpLineIcon } from '@solar-icons/react/broken/arrow-right-up';
import Image from 'next/image';
import { FloatingContact } from '@/components/floating-contact';
import { OwnerNavigation } from '@/components/owner-navigation';
import { SiteMotion } from '@/components/site-motion';
import { SiteSections } from '@/components/site-sections';
import { MobileHero } from '@/components/mobile-hero';
import { JsonLd, businessSchema, faqSchema } from '@/components/json-ld';
import { externalLink, photos, site, whatsappUrl } from '@/lib/site-config';
import './owner-hero.css';
import './floating-contact.css';

export default function Home() {
    return (
        <main id="topo" className="owner-home">
            <JsonLd data={businessSchema()} />
            <JsonLd data={faqSchema()} />
            <SiteMotion />
            <OwnerNavigation />

            <section id="inicio" className="owner-hero" aria-label="Locação de containers e caminhão Munck no Vale do Paraíba">
                <MobileHero />
                <div className="owner-hero__photo">
                    <Image src={photos.hero} alt="Caminhão Munck posicionando um container escritório em canteiro de obra" fill priority sizes="(max-width: 700px) 100vw, 72vw" />
                </div>
                <div className="owner-hero__wash" aria-hidden="true" />

                <div id="conteudo" className="owner-hero__copy">
                    <h1 id="owner-hero-title">
                        <span className="owner-hero__ribbon owner-hero__ribbon--first"><span>Containers</span></span>
                        <span className="owner-hero__ribbon owner-hero__ribbon--second"><span>e Munck</span></span>
                        <span className="owner-hero__title-line">no Vale do</span>
                        <span className="owner-hero__title-line">Paraíba.</span>
                    </h1>
                    <p className="owner-hero__description">
                        Locação, compra e venda de containers e locação de caminhão Munck em Jacareí, São José dos Campos e toda a região. Frota própria, desde {site.since}.
                    </p>
                    <div className="owner-hero__bottom">
                        <a href="#servicos" className="owner-hero__thumbnails" aria-label="Ver os tipos de container">
                            <Image src={photos.escritorio} alt="" width={160} height={135} />
                            <Image src={photos.obra} alt="" width={160} height={135} />
                        </a>
                        <a href={whatsappUrl} {...externalLink} className="owner-hero__cta">
                            <span className="owner-hero__cta-label">Pedir orçamento</span>
                            <span className="owner-hero__cta-icon"><ArrowRightUpLineIcon aria-hidden="true" /></span>
                        </a>
                    </div>
                </div>

                <div className="owner-hero__annotations" aria-hidden="true">
                    <svg className="owner-hero__outline" viewBox="0 0 850 720" fill="none" preserveAspectRatio="none">
                        <path d="M245 12H697C736 12 761 39 761 78V181C761 221 781 244 820 244H832C866 244 883 267 883 305V638C883 680 858 704 818 704H679C649 704 628 687 626 659L624 651C621 627 605 618 578 618H214C170 618 151 596 151 556V398C151 362 129 349 96 332L-3 279C-31 264-31 240-11 218C5 201 23 195 46 207L79 224C108 240 148 221 150 185L151 87C151 44 182 12 225 12Z" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <div className="owner-hero__callout owner-hero__callout--unit"><span>Munck próprio</span><svg viewBox="0 0 150 110"><path d="M12 0L27 35Q29 41 42 41H103Q116 41 121 55L139 96" /><circle cx="139" cy="96" r="7" /></svg></div>
                    <div className="owner-hero__callout owner-hero__callout--care"><span>Módulo 6 m</span><svg viewBox="0 0 70 130"><path d="M57 0V54Q57 65 40 74L21 87Q12 93 12 107V119" /><circle cx="12" cy="119" r="7" /></svg></div>
                </div>

                <div className="owner-hero__cards">
                    <div className="owner-hero__proof">
                        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="4" y="9" width="24" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M9 9V24M14 9V24M19 9V24M24 9V24" stroke="currentColor" strokeWidth="1.2" /></svg>
                        <strong>Desde<br />{site.since}.</strong>
                        <span>Jacareí · Vale do Paraíba</span>
                    </div>
                    <a href="#aplicacoes" className="owner-hero__project" aria-label="Ver onde a PH atua">
                        <Image src={photos.industria} alt="" fill sizes="(max-width: 700px) 35vw, 15vw" />
                        <span className="owner-hero__project-arrow"><ArrowRightUpIcon aria-hidden="true" /></span>
                        <span className="owner-hero__project-label">Onde atuamos</span>
                    </a>
                </div>
            </section>
            <SiteSections />
            <FloatingContact />
        </main>
    );
}
