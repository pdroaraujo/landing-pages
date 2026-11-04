import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import { BuildingsIcon } from '@solar-icons/react/bold/buildings';
import { ConditionerIcon } from '@solar-icons/react/bold/conditioner';
import { MagicWandIcon } from '@solar-icons/react/bold/magic-wand';
import { SledgehammerIcon } from '@solar-icons/react/bold/sledgehammer';
import Image from 'next/image';
import { FaqSection } from './faq-section';
import { ScrollRevealSection } from './scroll-reveal-section';
const contactUrl = '#contato';

const services = [
    {
        title: 'Instalação',
        copy: 'Montagem precisa, acabamento limpo e orientação para o primeiro uso.',
        image: '/card-service-installation-v1.png',
        alt: 'Ar-condicionado e ferramentas de instalação; imagem ilustrativa',
        position: 'center 8%',
        cta: 'Sobre instalação',
        icon: SledgehammerIcon,
    },
    {
        title: 'Manutenção',
        copy: 'Revisão preventiva para preservar desempenho, segurança e economia.',
        image: '/card-service-maintenance-v1.png',
        alt: 'Manutenção de ar-condicionado; imagem ilustrativa',
        position: 'center 51%',
        cta: 'Sobre manutenção',
        icon: ConditionerIcon,
    },
    {
        title: 'Reparos',
        copy: 'Avaliação de falhas para recuperar o funcionamento do equipamento.',
        image: '/card-service-cleaning-v1.png',
        alt: 'Equipamento de ar-condicionado aberto para serviço; imagem ilustrativa',
        position: 'center 30%',
        cta: 'Sobre reparos',
        icon: MagicWandIcon,
    },
    {
        title: 'Climatização comercial',
        copy: 'Soluções para empresas que precisam de conforto sem interromper a rotina.',
        image: '/card-service-commercial-v1.png',
        alt: 'Ambiente comercial climatizado; imagem ilustrativa',
        position: 'center 44%',
        cta: 'Sobre climatização comercial',
        icon: BuildingsIcon,
    },
];

const applications = [
    {
        title: 'Quartos e salas',
        place: 'Climatização residencial',
        image: '/card-project-bedroom-v1.png',
        position: 'center 45%',
    },
    {
        title: 'Instalação de split',
        place: 'Conforto no dia a dia',
        image: '/card-project-finishing-v1.png',
        position: 'center 40%',
    },
    {
        title: 'Sistemas externos',
        place: 'Revisão e manutenção',
        image: '/card-project-preventive-v1.png',
        position: 'center 44%',
    },
    {
        title: 'Espaços comerciais',
        place: 'Ambientes de trabalho',
        image: '/card-service-commercial-v1.png',
        position: 'center 40%',
    },
];

export function SiteSections() {
    return (
        <>
            <section id="destaque" className="feature-showcase">
                <div className="feature-showcase__inner">
                    <header className="feature-showcase__heading" data-scroll-reveal data-reveal="up">
                        <p className="section-label"><span aria-hidden="true">/</span>Template de climatização</p>
                        <h2>
                            <span className="feature-showcase__title-line">
                                Climatização confiável
                                <span className="feature-showcase__air" aria-hidden="true" />
                                e conforto
                            </span>
                            <span className="feature-showcase__title-line">
                                incomparável para casas e empresas.
                            </span>
                        </h2>
                    </header>

                    <div className="feature-showcase__body">
                        <aside className="feature-score" data-scroll-reveal data-reveal="left" data-reveal-delay="1">
                            <strong className="feature-score__number">04</strong>
                            <div className="feature-score__rail">
                                <span>Frentes de atuação</span>
                                <span aria-hidden="true" />
                            </div>

                            <div className="feature-score__quality">
                                <strong>04</strong>
                                <div>
                                    <span>Serviços de exemplo</span>
                                    <small>Conteúdo ilustrativo</small>
                                </div>
                            </div>

                            <div className="feature-score__services" aria-label="Quatro serviços">
                                <span><SledgehammerIcon aria-hidden="true" /></span>
                                <span><ConditionerIcon aria-hidden="true" /></span>
                                <span><MagicWandIcon aria-hidden="true" /></span>
                                <span><BuildingsIcon aria-hidden="true" /></span>
                                <b aria-hidden="true">+</b>
                            </div>
                        </aside>

                        <span className="feature-showcase__divider" aria-hidden="true" data-scroll-reveal data-reveal="scale" data-reveal-delay="2" />

                        <div className="feature-showcase__project" data-scroll-reveal data-reveal="right" data-reveal-delay="2">
                            <p>
                                Uma boa climatização começa com a leitura correta do espaço.
                                Capacidade, infraestrutura e instalação devem ser planejadas para unir
                                conforto, eficiência e estética.
                            </p>
                            <figure>
                                <Image
                                    src="/card-service-installation-v1.png"
                                    alt="Ar-condicionado e ferramentas; imagem ilustrativa"
                                    fill
                                    sizes="(min-width: 1024px) 54vw, 100vw"
                                    className="object-cover"
                                />
                                <a href="#servicos">
                                    Explorar serviços
                                    <span aria-hidden="true"><ArrowRightUpIcon /></span>
                                </a>
                            </figure>
                        </div>
                    </div>
                </div>
            </section>

            <ScrollRevealSection id="servicos" className="popular-services">
                <header className="popular-services__heading">
                    <p className="section-label"><span aria-hidden="true">/</span>Área de atuação</p>
                    <h2>O que oferecemos para cada tipo de ambiente</h2>
                </header>

                <div className="popular-services__grid">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <a
                                className={`service-card${index === 3 ? ' service-card--featured' : ''}`}
                                href={contactUrl}
                                aria-label={`Ver área de contato sobre ${service.title}`}
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
                        <small>Não sabe qual serviço escolher?</small>
                        <strong>Conte sobre o seu ambiente e receba uma orientação.</strong>
                    </span>
                    <a className="brand-button" href={contactUrl}>
                        Ver área de contato <ArrowRightUpIcon />
                    </a>
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
                        <p className="section-label section-label--dark"><span aria-hidden="true">/</span>Aplicações</p>
                        <h2>Conforto para cada ambiente.</h2>
                    </div>
                    <div className="completed-projects__intro" data-scroll-reveal data-reveal="right" data-reveal-delay="1">
                        <p>
                            Do quarto à empresa, cada espaço pede uma solução
                            de climatização adequada. Imagens ilustrativas.
                        </p>
                        <a href={contactUrl}>
                            Ver área de contato <ArrowRightUpIcon />
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

            <footer className="site-footer">
                <section className="footer-cta" aria-labelledby="footer-cta-title">
                    <Image
                        src="/footer-panorama-v1.png"
                        alt="Ar-condicionado centralizado em um ambiente moderno iluminado em azul"
                        fill
                        sizes="100vw"
                        className="footer-cta__image"
                    />
                    <div className="footer-cta__shade" aria-hidden="true" />
                    <svg
                        className="footer-cta__top-curve"
                        viewBox="0 0 1600 80"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path
                            className="footer-cta__top-curve-surface"
                            d="M0 0H526C548 0 557 5 571 16L590 31C600 39 612 42 628 42H972C988 42 1000 39 1010 31L1029 16C1043 5 1052 0 1074 0H1600V0H0Z"
                        />
                        <path
                            className="footer-cta__top-curve-rim"
                            d="M526 0C548 0 557 5 571 16L590 31C600 39 612 42 628 42H972C988 42 1000 39 1010 31L1029 16C1043 5 1052 0 1074 0"
                        />
                    </svg>
                    <div className="footer-cta__content" data-scroll-reveal data-reveal="scale">
                        <h2 id="footer-cta-title">
                            <span className="footer-cta__title-main">Seu próximo clima ideal</span>
                            <span>começa aqui.</span>
                        </h2>
                        <small>
                            Instalação, manutenção e reparos com atenção
                            do primeiro contato à entrega.
                        </small>
                        <a href={contactUrl}>
                            <span className="footer-cta__button-label">Ver área de contato</span>
                            <span className="footer-cta__button-icon" aria-hidden="true"><ArrowRightUpIcon /></span>
                        </a>
                    </div>
                </section>

                <div id="rodape" className="footer-main">
                    <div className="footer-main__inner">
                        <div className="footer-main__compact" data-scroll-reveal data-reveal="up">
                            <div className="footer-brand">
                                <a href="#topo" aria-label="Template Code Makers — voltar ao início" className="footer-brand__name">
                                    Template Code Makers
                                </a>
                                <p>
                                    Climatização residencial e comercial<br />
                                    em um layout demonstrativo.
                                </p>
                            </div>

                            <div id="contato" className="footer-contact">
                                <span className="footer-contact__copy">
                                    <small>Espaço para personalizar</small>
                                    <strong>Seus canais de contato</strong>
                                    <span>Adicione telefone, e-mail ou formulário.</span>
                                </span>
                                <span className="footer-contact__arrow" aria-hidden="true"><ArrowRightUpIcon /></span>
                            </div>
                        </div>

                        <div className="footer-main__utility" data-scroll-reveal data-reveal="up" data-reveal-delay="1">
                            <nav className="footer-nav" aria-label="Navegação do rodapé">
                                <a href="#servicos">Serviços</a>
                                <a href="#aplicacoes">Aplicações</a>
                                <a href="#duvidas">Dúvidas</a>
                            </nav>

                            <span className="footer-location">Endereço e área atendida: personalize aqui.</span>
                            <span className="footer-location">Horário de atendimento: personalize aqui.</span>
                        </div>

                        <div id="rodape-fim" className="footer-main__bottom" data-scroll-reveal data-reveal="up" data-reveal-delay="2">
                            <p>Template demonstrativo Code Makers. Personalize antes de publicar.</p>
                            <div>
                                <a href="#topo">Voltar ao topo <ArrowRightUpIcon /></a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
