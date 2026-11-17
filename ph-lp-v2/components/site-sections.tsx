import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import { BathIcon } from '@solar-icons/react/bold/bath';
import { BoxIcon } from '@solar-icons/react/bold/box';
import { CaseIcon } from '@solar-icons/react/bold/case';
import { CheckCircleIcon } from '@solar-icons/react/bold/check-circle';
import { TruckIcon } from '@solar-icons/react/bold/truck';
import Image from 'next/image';
import { cidadePath, cidades, cidadesPorRegiao } from '@/lib/cidades';
import { externalLink, photos, site, whatsappFor, whatsappUrl, yearsInBusiness } from '@/lib/site-config';
import { ClientsStrip } from './clients-strip';
import { FaqSection } from './faq-section';
import { ScrollRevealSection } from './scroll-reveal-section';
import { SiteFooter } from './site-footer';

const services = [
    {
        title: 'Container escritório',
        copy: 'Com ar-condicionado, janelas e instalação elétrica. Pronto para virar escritório de obra, plantão ou apoio.',
        image: photos.escritorio,
        alt: 'Interior de container escritório com mesa, cadeiras e ar-condicionado',
        position: 'center 50%',
        topic: 'container escritório',
        icon: CaseIcon,
    },
    {
        title: 'Depósito e almoxarifado',
        copy: 'Ferramentas, materiais e equipamentos guardados com segurança no próprio canteiro ou na fábrica.',
        image: photos.almoxarifado,
        alt: 'Container almoxarifado aberto com prateleiras de ferramentas',
        position: 'center 45%',
        topic: 'container almoxarifado',
        icon: BoxIcon,
    },
    {
        title: 'Banheiro e vestiário',
        copy: 'Container sanitário com vasos, chuveiros e lavatórios para equipes de obra e eventos.',
        image: photos.sanitario,
        alt: 'Interior de container vestiário com lavatórios, chuveiros e armários',
        position: 'center 50%',
        topic: 'container banheiro e vestiário',
        icon: BathIcon,
    },
    {
        title: 'Caminhão Munck',
        copy: 'Transporte, carga e descarga, remoção de máquinas e içamento de painéis e totens.',
        image: photos.munck,
        alt: 'Caminhão Munck içando uma máquina industrial',
        position: 'center 45%',
        topic: 'caminhão Munck',
        icon: TruckIcon,
    },
];

const steps = [
    { label: 'Passo 01', title: 'Orçamento no WhatsApp', copy: 'Conte o uso, o tempo de locação e a cidade. A resposta sai no mesmo dia.' },
    { label: 'Passo 02', title: 'Modelo e local definidos', copy: 'A equipe indica o container certo e orienta sobre o terreno, que precisa estar nivelado e com acesso.' },
    { label: 'Passo 03', title: 'Entrega com Munck próprio', copy: 'O guindauto da PH posiciona o container no ponto combinado, sem terceirizar.' },
    { label: 'Passo 04', title: 'Retirada no fim do contrato', copy: 'Diária, mensal ou pelo período da obra. Terminou, a PH busca.' },
];

const applications = [
    { title: 'Canteiros de obra', place: 'Escritório, almoxarifado e vestiário', image: photos.obra, position: 'center 40%' },
    { title: 'Indústria', place: 'Paradas de manutenção e apoio', image: photos.industria, position: 'center 50%' },
    { title: 'Plantão de vendas', place: 'Loteamentos e lançamentos', image: photos.plantao, position: 'center 45%' },
    { title: 'Carga e içamento', place: 'Máquinas, painéis e totens', image: photos.munck, position: 'center 55%' },
];

export function SiteSections() {
    return (
        <>
            <ClientsStrip />

            <section id="destaque" className="feature-showcase">
                <div className="feature-showcase__inner">
                    <header className="feature-showcase__heading" data-scroll-reveal data-reveal="up">
                        <p className="section-label"><span aria-hidden="true">/</span>PH Container · desde {site.since}</p>
                        <h2>
                            <span className="feature-showcase__title-line">
                                O container chega
                                <span className="feature-showcase__air" aria-hidden="true" />
                                no Munck
                            </span>
                            <span className="feature-showcase__title-line">da casa, no dia combinado.</span>
                        </h2>
                    </header>

                    <div className="feature-showcase__body">
                        <aside className="feature-score" data-scroll-reveal data-reveal="left" data-reveal-delay="1">
                            <strong className="feature-score__number">{yearsInBusiness}</strong>
                            <div className="feature-score__rail">
                                <span>Anos de operação</span>
                                <span aria-hidden="true" />
                            </div>

                            <div className="feature-score__quality">
                                <strong>{cidades.length}</strong>
                                <div>
                                    <span>Cidades atendidas</span>
                                    <small>Do Vale ao Litoral Norte</small>
                                </div>
                            </div>

                            <div className="feature-score__services" aria-label="Escritório, almoxarifado, sanitário e Munck">
                                <span><CaseIcon aria-hidden="true" /></span>
                                <span><BoxIcon aria-hidden="true" /></span>
                                <span><BathIcon aria-hidden="true" /></span>
                                <span><TruckIcon aria-hidden="true" /></span>
                                <b aria-hidden="true">+</b>
                            </div>
                        </aside>

                        <span className="feature-showcase__divider" aria-hidden="true" data-scroll-reveal data-reveal="scale" data-reveal-delay="2" />

                        <div className="feature-showcase__project" data-scroll-reveal data-reveal="right" data-reveal-delay="2">
                            <p>
                                A PH Container aluga, compra e vende containers e opera a própria frota de
                                caminhões Munck. Quem entrega é quem cuida do equipamento, o que dá mais
                                controle de prazo e mais segurança na colocação.
                            </p>
                            <figure>
                                <Image src={photos.obra} alt="Containers escritório empilhados em canteiro de obra" fill sizes="(min-width: 1024px) 54vw, 100vw" className="object-cover" style={{ objectPosition: 'center 62%' }} />
                                <a href="#servicos">
                                    Ver os containers
                                    <span aria-hidden="true"><ArrowRightUpIcon /></span>
                                </a>
                            </figure>
                        </div>
                    </div>
                </div>
            </section>

            <ScrollRevealSection id="servicos" className="popular-services">
                <header className="popular-services__heading">
                    <p className="section-label"><span aria-hidden="true">/</span>Locação</p>
                    <h2>Um container para cada frente da obra</h2>
                </header>

                <div className="popular-services__grid">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <a
                                className={`service-card${index === 3 ? ' service-card--featured' : ''}`}
                                href={whatsappFor(service.topic)}
                                {...externalLink}
                                aria-label={`Pedir orçamento de ${service.topic} pelo WhatsApp`}
                                key={service.title}
                            >
                                <div className="service-card__media">
                                    <Image src={service.image} alt={service.alt} fill sizes="(min-width: 1100px) 22vw, (min-width: 700px) 45vw, 100vw" className="object-cover" style={{ objectPosition: service.position }} />
                                </div>
                                <div className="service-card__body">
                                    <span className="service-card__icon" aria-hidden="true"><Icon /></span>
                                    <h3>{service.title}</h3>
                                    <p>{service.copy}</p>
                                    <span className="service-card__cta">Pedir orçamento <ArrowRightUpIcon /></span>
                                    <span className="service-card__number" aria-hidden="true">0{index + 1}</span>
                                </div>
                            </a>
                        );
                    })}
                </div>

                <div className="popular-services__cta" data-scroll-reveal data-reveal="up">
                    <span>
                        <small>Também tem plantão de vendas e refeitório.</small>
                        <strong>Não sabe qual modelo pedir? Descreva o uso e a PH indica.</strong>
                    </span>
                    <a className="brand-button" href={whatsappUrl} {...externalLink}>
                        Falar no WhatsApp <ArrowRightUpIcon />
                    </a>
                </div>
            </ScrollRevealSection>

            <section id="modulos" className="ph-modules" aria-labelledby="modulos-title">
                <div className="ph-modules__inner">
                    <header className="ph-modules__heading" data-scroll-reveal data-reveal="up">
                        <p className="section-label"><span aria-hidden="true">/</span>Medidas</p>
                        <h2 id="modulos-title">Dois tamanhos. Combine, empilhe, monte o que a obra pede.</h2>
                    </header>
                    <div className="ph-modules__grid">
                        <article className="ph-module" data-scroll-reveal data-reveal="up" data-reveal-delay="1">
                            <ContainerDrawing size={20} />
                            <div className="ph-module__spec">
                                <strong>6 m</strong>
                                <span>20 pés</span>
                            </div>
                            <p>O mais pedido. Cabe em terrenos menores e serve de escritório, almoxarifado ou vestiário.</p>
                        </article>
                        <article className="ph-module" data-scroll-reveal data-reveal="up" data-reveal-delay="2">
                            <ContainerDrawing size={40} />
                            <div className="ph-module__spec">
                                <strong>12 m</strong>
                                <span>40 pés</span>
                            </div>
                            <p>O dobro de área para equipes maiores, refeitórios e estoques volumosos.</p>
                        </article>
                    </div>
                    <p className="ph-modules__note" data-scroll-reveal data-reveal="up">
                        Os módulos podem ser combinados lado a lado ou sobrepostos conforme o projeto.
                    </p>
                </div>
            </section>

            <section id="quem-somos" className="repair-about" aria-labelledby="quem-somos-title">
                <div className="repair-about__inner">
                    <div className="repair-collage" data-scroll-reveal data-reveal="left">
                        <figure className="repair-collage__main">
                            <Image src={photos.container} alt="Container escritório da PH Container com janela e porta" fill sizes="(min-width: 1024px) 34vw, 90vw" className="object-cover" />
                        </figure>
                        <figure className="repair-collage__detail">
                            <Image src={photos.hero} alt="" fill sizes="(min-width: 1024px) 22vw, 50vw" className="object-cover" />
                        </figure>
                        <div className="repair-collage__seal" aria-hidden="true">
                            <span>Desde</span>
                            <strong>{site.since}</strong>
                            <small>Jacareí/SP</small>
                        </div>
                        <span className="repair-collage__dots" aria-hidden="true" />
                    </div>
                    <div className="repair-about__copy" data-scroll-reveal data-reveal="right" data-reveal-delay="1">
                        <p className="section-label"><span aria-hidden="true">/</span>Quem somos</p>
                        <h2 id="quem-somos-title">Mais de 30 anos <span>de Vale do Paraíba.</span></h2>
                        <p className="repair-about__lead">
                            A PH Container trabalha com locação, compra e venda de containers e locação de caminhão
                            Munck. A equipe atende cada projeto do jeito que ele precisa, do canteiro de obra à
                            indústria, com eficiência, segurança e confiabilidade.
                        </p>
                        <ul className="repair-about__points">
                            <li><CheckCircleIcon aria-hidden="true" />Frota própria de guindautos, sem terceirizar a entrega</li>
                            <li><CheckCircleIcon aria-hidden="true" />Sede em Jacareí, com atendimento em {cidades.length} cidades</li>
                            <li><CheckCircleIcon aria-hidden="true" />Clientes como Ambev, Heineken, Nestlé e Suzano</li>
                        </ul>
                        <a className="brand-button" href="/sobre/">
                            Conhecer a PH <ArrowRightUpIcon />
                        </a>
                    </div>
                </div>
            </section>

            <section id="como-funciona" className="work-process" aria-labelledby="como-funciona-title">
                <div className="work-process__panel">
                    <div className="work-process__inner">
                        <div className="work-process__intro" data-scroll-reveal data-reveal="left">
                            <p className="section-label section-label--dark"><span aria-hidden="true">/</span>Como funciona</p>
                            <h2 id="como-funciona-title">Do orçamento à retirada, <span>sem complicação.</span></h2>
                            <p className="work-process__lead">
                                Em geral, o container chega de 1 a 3 dias úteis depois da confirmação,
                                conforme a cidade e o modelo disponível.
                            </p>
                            <a href={whatsappUrl} {...externalLink}>
                                Começar pelo WhatsApp <ArrowRightUpIcon />
                            </a>
                            <p className="work-process__promise"><i aria-hidden="true" />Diária · mensal · por obra</p>
                        </div>
                        <ol className="work-process__steps" data-scroll-reveal data-reveal="right" data-reveal-delay="1">
                            {steps.map((step, index) => (
                                <li key={step.title}>
                                    <span className="work-process__number" aria-hidden="true">0{index + 1}</span>
                                    <small>{step.label}</small>
                                    <h3>{step.title}</h3>
                                    <p>{step.copy}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            <ScrollRevealSection id="aplicacoes" className="completed-projects" cursorTargetSelector=".project-shot__media" reveal={false}>
                <div className="completed-projects__wash" aria-hidden="true" />
                <svg className="completed-projects__top-curve" viewBox="0 0 1600 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <path className="completed-projects__top-curve-surface" d="M0 0H526C548 0 557 5 571 16L590 31C600 39 612 42 628 42H972C988 42 1000 39 1010 31L1029 16C1043 5 1052 0 1074 0H1600V0H0Z" />
                    <path className="completed-projects__top-curve-rim" d="M526 0C548 0 557 5 571 16L590 31C600 39 612 42 628 42H972C988 42 1000 39 1010 31L1029 16C1043 5 1052 0 1074 0" />
                </svg>
                <header className="completed-projects__heading">
                    <div data-scroll-reveal data-reveal="left">
                        <p className="section-label section-label--dark"><span aria-hidden="true">/</span>Onde atuamos</p>
                        <h2>Da obra à fábrica.</h2>
                    </div>
                    <div className="completed-projects__intro" data-scroll-reveal data-reveal="right" data-reveal-delay="1">
                        <p>Construtoras, indústrias, prefeituras e eventos usam os containers e o Munck da PH. Imagens ilustrativas.</p>
                        <a href={whatsappUrl} {...externalLink}>
                            Pedir orçamento <ArrowRightUpIcon />
                        </a>
                    </div>
                </header>

                <div className="completed-projects__grid" data-scroll-reveal data-reveal="bento">
                    {applications.map((project, index) => (
                        <figure className={`project-shot project-shot--${index + 1}`} key={project.title}>
                            <div className="project-shot__media">
                                <Image src={project.image} alt={project.title} fill sizes="(min-width: 1100px) 24vw, (min-width: 700px) 48vw, 100vw" className="object-cover" style={{ objectPosition: project.position }} />
                            </div>
                            <figcaption>
                                <span aria-hidden="true">/ 0{index + 1}</span>
                                <div><strong>{project.title}</strong><small>{project.place}</small></div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </ScrollRevealSection>

            <section id="cidades" className="ph-cities" aria-labelledby="cidades-title">
                <div className="ph-cities__inner">
                    <header className="ph-cities__heading" data-scroll-reveal data-reveal="up">
                        <p className="section-label"><span aria-hidden="true">/</span>Área de atendimento</p>
                        <h2 id="cidades-title">{cidades.length} cidades, de Jacareí ao Litoral Norte.</h2>
                        <p>Escolha a sua cidade para ver prazo de entrega e detalhes do atendimento.</p>
                    </header>
                    <div className="ph-cities__groups">
                        {cidadesPorRegiao.map((grupo, i) => (
                            <div className="ph-cities__group" key={grupo.regiao} data-scroll-reveal data-reveal="up" data-reveal-delay={String(Math.min(i + 1, 4))}>
                                <h3>{grupo.nome}<small>{grupo.cidades.length}</small></h3>
                                <ul>
                                    {grupo.cidades.map((c) => (
                                        <li key={c.slug}><a href={cidadePath(c)}>{c.nome}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <FaqSection />
            <SiteFooter />
        </>
    );
}

/** Desenho técnico do container (vista lateral), com a cota de comprimento. */
function ContainerDrawing({ size }: { size: 20 | 40 }) {
    const w = size === 20 ? 150 : 300;
    const x0 = (320 - w) / 2;
    const ribs = Array.from({ length: Math.floor(w / 12) - 1 }, (_, i) => x0 + 10 + i * 12);
    return (
        <svg className="ph-module__drawing" viewBox="0 0 320 130" role="img" aria-label={`Container de ${size} pés visto de lado`}>
            <rect x={x0} y="22" width={w} height="70" rx="3" className="ph-module__body" />
            {ribs.map((x) => <line key={x} x1={x} y1="28" x2={x} y2="86" className="ph-module__rib" />)}
            <rect x={x0 + w - 34} y="36" width="22" height="50" className="ph-module__door" />
            <rect x={x0 + 18} y="40" width="30" height="20" className="ph-module__window" />
            <line x1={x0} y1="112" x2={x0 + w} y2="112" className="ph-module__dim" />
            <line x1={x0} y1="104" x2={x0} y2="120" className="ph-module__dim" />
            <line x1={x0 + w} y1="104" x2={x0 + w} y2="120" className="ph-module__dim" />
        </svg>
    );
}
