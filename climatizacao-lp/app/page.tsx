import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import { ArrowRightUpIcon as ArrowRightUpLineIcon } from '@solar-icons/react/broken/arrow-right-up';
import Image from 'next/image';
import { FloatingContact } from '@/components/floating-contact';
import { OwnerNavigation } from '@/components/owner-navigation';
import { SiteMotion } from '@/components/site-motion';
import { SiteSections } from '@/components/site-sections';
import { MobileHero } from '@/components/mobile-hero';
import './owner-hero.css';
import './floating-contact.css';

export default function Home() {
    return (
        <main id="topo" className="owner-home">
            <SiteMotion />
            <OwnerNavigation contactUrl="#contato" />

            <section id="inicio" className="owner-hero" aria-label="Climatização especializada para o seu ambiente">
                <MobileHero contactUrl="#contato" />
                <div className="owner-hero__photo">
                    <Image src="/hero-technician.png" alt="Profissional realizando manutenção em ar-condicionado; imagem ilustrativa" fill priority sizes="(max-width: 700px) 100vw, 72vw" />
                </div>
                <div className="owner-hero__wash" aria-hidden="true" />

                <div className="owner-hero__copy">
                    <h1 id="owner-hero-title">
                        <span className="owner-hero__ribbon owner-hero__ribbon--first"><span>Climatização</span></span>
                        <span className="owner-hero__ribbon owner-hero__ribbon--second"><span>especializada.</span></span>
                        <span className="owner-hero__title-line">Para o seu</span>
                        <span className="owner-hero__title-line">ambiente.</span>
                    </h1>
                    <p className="owner-hero__description">Um espaço para apresentar serviços de instalação, manutenção e reparos em ar-condicionado.</p>
                    <div className="owner-hero__bottom">
                        <a href="#aplicacoes" className="owner-hero__thumbnails" aria-label="Veja aplicações de climatização">
                            <Image src="/card-service-installation-v1.png" alt="" width={160} height={135} />
                            <Image src="/card-project-bedroom-v1.png" alt="" width={160} height={135} />
                        </a>
                        <a href="#contato" className="owner-hero__cta">
                            <span className="owner-hero__cta-label">Ver área de contato</span>
                            <span className="owner-hero__cta-icon"><ArrowRightUpLineIcon aria-hidden="true" /></span>
                        </a>
                    </div>
                </div>

                <div className="owner-hero__annotations" aria-hidden="true">
                    <svg className="owner-hero__outline" viewBox="0 0 850 720" fill="none" preserveAspectRatio="none">
                        <path d="M245 12H697C736 12 761 39 761 78V181C761 221 781 244 820 244H832C866 244 883 267 883 305V638C883 680 858 704 818 704H679C649 704 628 687 626 659L624 651C621 627 605 618 578 618H214C170 618 151 596 151 556V398C151 362 129 349 96 332L-3 279C-31 264-31 240-11 218C5 201 23 195 46 207L79 224C108 240 148 221 150 185L151 87C151 44 182 12 225 12Z" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <div className="owner-hero__callout owner-hero__callout--unit"><span>Hi-wall</span><svg viewBox="0 0 150 110"><path d="M12 0L27 35Q29 41 42 41H103Q116 41 121 55L139 96" /><circle cx="139" cy="96" r="7" /></svg></div>
                    <div className="owner-hero__callout owner-hero__callout--care"><span>Cuidado técnico</span><svg viewBox="0 0 70 130"><path d="M57 0V54Q57 65 40 74L21 87Q12 93 12 107V119" /><circle cx="12" cy="119" r="7" /></svg></div>
                </div>

                <div className="owner-hero__cards">
                    <div className="owner-hero__proof">
                        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 3L27 7V15C27 22 22 27 16 29C10 27 5 22 5 15V7L16 3Z" stroke="currentColor" strokeWidth="1.5" /><path d="M10 16L14 20L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <strong>Cuidado<br />técnico.</strong>
                        <span>Do início à entrega.</span>
                    </div>
                    <a href="#aplicacoes" className="owner-hero__project" aria-label="Ver aplicações de climatização">
                        <Image src="/card-project-bedroom-v1.png" alt="" fill sizes="(max-width: 700px) 35vw, 15vw" />
                        <span className="owner-hero__project-arrow"><ArrowRightUpIcon aria-hidden="true" /></span>
                        <span className="owner-hero__project-label">Ver aplicações</span>
                    </a>
                </div>
            </section>
            <SiteSections />
            <FloatingContact contactUrl="#contato" />
        </main>
    );
}
