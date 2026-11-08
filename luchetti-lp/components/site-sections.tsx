import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import { FireIcon } from '@solar-icons/react/bold/fire';
import { WindIcon } from '@solar-icons/react/bold/wind';
import { ShieldCheckIcon } from '@solar-icons/react/bold/shield-check';
import { WaterdropIcon } from '@solar-icons/react/bold/waterdrop';
import Image from 'next/image';
import { BudgetPicker } from './budget-picker';
import { FaqSection } from './faq-section';
import { HistorySection } from './history-section';
import { ScrollRevealSection } from './scroll-reveal-section';
import { SiteFooter } from './site-footer';
import {
    ctaLinkProps,
    ctaUrl,
    photos,
    site,
    yearsInBusiness,
} from '@/lib/site-config';

const contactUrl = ctaUrl;

const services = [
    {
        slug: 'hidraulica',
        title: 'Hidráulica',
        copy: 'Tubos, conexões, válvulas, registros, bombas, drenagem, PEAD, cisternas, fossas e biodigestores.',
        image: photos.hidraulica,
        alt: 'Estoque de tubos e conexões de PVC',
        position: 'center 40%',
        cta: 'Ver soluções',
        icon: WaterdropIcon,
    },
    {
        slug: 'impermeabilizacao',
        title: 'Impermeabilização',
        copy: 'Mantas asfálticas, membranas líquidas, selantes, grautes, aditivos, argamassas especiais e isolantes térmicos e acústicos.',
        image: photos.impermeabilizacaoReal,
        alt: 'Aplicação de manta asfáltica',
        position: 'center 50%',
        cta: 'Ver soluções',
        icon: ShieldCheckIcon,
    },
    {
        slug: 'gas-e-pci',
        title: 'Gás e PCI',
        copy: 'Multicamadas, termofusão, reguladores e ferramentas para gás. Para incêndio: Amanco Fire, ranhurado, galvanizado e aço carbono.',
        image: photos.pciReal,
        alt: 'Tubulação vermelha de combate a incêndio com sprinklers',
        position: 'center 50%',
        cta: 'Ver soluções',
        icon: FireIcon,
    },
    {
        slug: 'avac-e-acabamentos',
        title: 'AVAC e acabamentos',
        copy: 'Aquecimento, ventilação e ar-condicionado, além de louças, metais, revestimentos e soluções de acessibilidade.',
        image: photos.avacReal,
        alt: 'Duto e difusor de ar-condicionado',
        position: 'center 50%',
        cta: 'Ver soluções',
        icon: WindIcon,
    },
];

const applications = [
    {
        title: 'Construtoras e empreiteiras',
        place: 'Obras de todos os portes',
        image: photos.construtoras,
        position: 'center 45%',
    },
    {
        title: 'Banheiros e cozinhas',
        place: 'Louças, metais e acabamentos',
        image: photos.banheiros,
        position: 'center 40%',
    },
    {
        title: 'Lajes e reservatórios',
        place: 'Impermeabilização',
        image: photos.lajes,
        position: 'center 44%',
    },
    {
        title: 'Engenheiros e arquitetos',
        place: 'Especificação técnica',
        image: photos.engenharia,
        position: 'center 40%',
    },
];

export function SiteSections() {
    return (
        <>
            <section id="destaque" className="feature-showcase">
                <div className="feature-showcase__inner">
                    <header className="feature-showcase__heading" data-scroll-reveal data-reveal="up">
                        <p className="section-label"><span aria-hidden="true">/</span>Luchetti · desde {site.since}</p>
                        <h2>
                            <span className="feature-showcase__title-line">
                                Sua obra,
                                <span className="feature-showcase__air" aria-hidden="true" />
                                nossas soluções.
                            </span>
                            <span className="feature-showcase__title-line">
                                Do alicerce ao acabamento.
                            </span>
                        </h2>
                    </header>

                    <div className="feature-showcase__body">
                        <aside className="feature-score" data-scroll-reveal data-reveal="left" data-reveal-delay="1">
                            <strong className="feature-score__number">{yearsInBusiness}</strong>
                            <div className="feature-score__rail">
                                <span>Anos de mercado</span>
                                <span aria-hidden="true" />
                            </div>

                            <div className="feature-score__quality">
                                <strong>10 mil</strong>
                                <div>
                                    <span>Produtos no portfólio</span>
                                    <small>Distribuidor técnico Amanco Wavin</small>
                                </div>
                            </div>

                            <div className="feature-score__services" role="group" aria-label="Linhas de produto: hidráulica, impermeabilização, gás e PCI, AVAC e acabamentos">
                                <span><WaterdropIcon aria-hidden="true" /></span>
                                <span><ShieldCheckIcon aria-hidden="true" /></span>
                                <span><FireIcon aria-hidden="true" /></span>
                                <span><WindIcon aria-hidden="true" /></span>
                                <b aria-hidden="true">+</b>
                            </div>
                        </aside>

                        <span className="feature-showcase__divider" aria-hidden="true" data-scroll-reveal data-reveal="scale" data-reveal-delay="2" />

                        <div className="feature-showcase__project" data-scroll-reveal data-reveal="right" data-reveal-delay="2">
                            <p>
                                Distribuidora técnica nascida em {site.city}, hoje na 5ª geração da família.
                                São {yearsInBusiness} anos fornecendo a tubulação, a impermeabilização e os acabamentos
                                certos, com entrega rápida e quem entende de obra do outro lado do balcão.
                            </p>
                            <figure>
                                <Image
                                    src={photos.hidraulica}
                                    alt="Tubos e conexões hidráulicas"
                                    fill
                                    sizes="(min-width: 1024px) 54vw, 100vw"
                                    className="object-cover"
                                />
                                <a href="#servicos">
                                    Ver linhas de produto
                                    <span aria-hidden="true"><ArrowRightUpIcon /></span>
                                </a>
                            </figure>
                        </div>
                    </div>
                </div>
            </section>

            <HistorySection />

            <ScrollRevealSection id="servicos" className="popular-services">
                <header className="popular-services__heading">
                    <p className="section-label"><span aria-hidden="true">/</span>Linhas de produto</p>
                    <h2>Tudo o que a obra pede, da tubulação à laje</h2>
                </header>

                <div className="popular-services__grid">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <a
                                className={`service-card${index === 3 ? ' service-card--featured' : ''}`}
                                href={`/solucoes/${service.slug}`}
                                aria-label={`Ver soluções de ${service.title}`}
                                key={service.title}
                            >
                                <div className="service-card__media">
                                    <Image
                                        src={service.image}
                                        alt={service.alt}
                                        fill
                                        sizes="(min-width: 1100px) 22vw, (min-width: 700px) 45vw, 100vw"
                                        className="object-cover"
                                        style={{ objectPosition: service.position }}
                                    />
                                </div>
                                <div className="service-card__body">
                                    <span className="service-card__icon" aria-hidden="true"><Icon /></span>
                                    <h3>{service.title}</h3>
                                    <p>{service.copy}</p>
                                    <span className="service-card__cta">
                                        {service.cta} <ArrowRightUpIcon />
                                    </span>
                                    <span className="service-card__number" aria-hidden="true">0{index + 1}</span>
                                </div>
                            </a>
                        );
                    })}
                </div>

                <div className="popular-services__cta" data-scroll-reveal data-reveal="up">
                    <span>
                        <small>Não sabe qual material especificar?</small>
                        <strong>Fale com nosso time e receba a indicação certa para a sua obra.</strong>
                    </span>
                    <BudgetPicker />
                </div>
            </ScrollRevealSection>

            <ScrollRevealSection
                id="aplicacoes"
                className="completed-projects"
                cursorTargetSelector=".project-shot__media"
                reveal={false}
            >
                <div className="completed-projects__wash" aria-hidden="true" />
                <svg
                    className="completed-projects__top-curve"
                    viewBox="0 0 1600 80"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path
                        className="completed-projects__top-curve-surface"
                        d="M0 0H526C548 0 557 5 571 16L590 31C600 39 612 42 628 42H972C988 42 1000 39 1010 31L1029 16C1043 5 1052 0 1074 0H1600V0H0Z"
                    />
                    <path
                        className="completed-projects__top-curve-rim"
                        d="M526 0C548 0 557 5 571 16L590 31C600 39 612 42 628 42H972C988 42 1000 39 1010 31L1029 16C1043 5 1052 0 1074 0"
                    />
                </svg>
                <header className="completed-projects__heading">
                    <div data-scroll-reveal data-reveal="left">
                        <p className="section-label section-label--dark"><span aria-hidden="true">/</span>Para quem atendemos</p>
                        <h2>Do canteiro ao acabamento.</h2>
                    </div>
                    <div className="completed-projects__intro" data-scroll-reveal data-reveal="right" data-reveal-delay="1">
                        <p>
                            Construtoras, empreiteiras, engenheiros, arquitetos e clientes finais.
                            Atendemos todo o Brasil, com foco no Vale do Paraíba e Litoral Norte.
                        </p>
                        <a href={contactUrl} {...ctaLinkProps}>
                            Solicitar orçamento <ArrowRightUpIcon />
                        </a>
                    </div>
                </header>

                <div
                    className="completed-projects__grid"
                    data-scroll-reveal
                    data-reveal="bento"
                >
                    {applications.map((project, index) => (
                        <figure
                            className={`project-shot project-shot--${index + 1}`}
                            key={`${project.title}-${project.position}`}
                        >
                            <div className="project-shot__media">
                            <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                sizes="(min-width: 1100px) 24vw, (min-width: 700px) 48vw, 100vw"
                                className="object-cover"
                                style={{ objectPosition: project.position }}
                            />
                            </div>
                            <figcaption>
                                <span aria-hidden="true">/ 0{index + 1}</span>
                                <div><strong>{project.title}</strong><small>{project.place}</small></div>
                            </figcaption>
                        </figure>
                    ))}
                </div>

                <svg
                    className="completed-projects__bottom-arc"
                    viewBox="0 0 1600 285"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    focusable="false"
                >
                    <defs>
                        <linearGradient
                            id="projects-arc-surface"
                            x1="0"
                            y1="42"
                            x2="0"
                            y2="285"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="68%" stopColor="#ffffff" />
                            <stop offset="100%" stopColor="#f4f8fb" />
                        </linearGradient>
                        <filter
                            id="projects-arc-shadow-down"
                            x="-10%"
                            y="-40%"
                            width="120%"
                            height="220%"
                            colorInterpolationFilters="sRGB"
                        >
                            <feGaussianBlur in="SourceGraphic" stdDeviation="13" result="soft-shadow" />
                            <feOffset in="soft-shadow" dy="17" />
                        </filter>
                        <filter
                            id="projects-arc-contact-down"
                            x="-10%"
                            y="-30%"
                            width="120%"
                            height="180%"
                            colorInterpolationFilters="sRGB"
                        >
                            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="contact-shadow" />
                            <feOffset in="contact-shadow" dy="7" />
                        </filter>
                    </defs>
                    <path
                        className="completed-projects__bottom-arc-surface"
                        d="M0 202 Q800 42 1600 202 V285 H0 Z"
                    />
                    <path
                        className="completed-projects__bottom-arc-shadow-down"
                        d="M0 202 Q800 42 1600 202"
                        filter="url(#projects-arc-shadow-down)"
                    />
                    <path
                        className="completed-projects__bottom-arc-contact-down"
                        d="M0 202 Q800 42 1600 202"
                        filter="url(#projects-arc-contact-down)"
                    />
                    <path
                        className="completed-projects__bottom-arc-seam"
                        d="M0 202 Q800 42 1600 202"
                    />
                </svg>
            </ScrollRevealSection>

            <FaqSection contactUrl={contactUrl} />

            <SiteFooter />
        </>
    );
}
