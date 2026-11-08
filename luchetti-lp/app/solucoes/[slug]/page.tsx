import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { FloatingContact } from '@/components/floating-contact';
import { OwnerNavigation } from '@/components/owner-navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteMotion } from '@/components/site-motion';
import { ctaLinkProps, ctaUrl, site, whatsappLinkFor } from '@/lib/site-config';
import { getSolution, solutions, type SolutionBlock } from '@/lib/solutions';
import '../../owner-hero.css';
import '../../floating-contact.css';
import '../../brand.css';
import '../../solution-page.css';

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
    return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const solution = getSolution(slug);
    if (!solution) return {};

    const title = `${solution.title} | ${site.name}`;
    const description = `${solution.tagline} Atacado para construtoras, engenheiros e arquitetos em ${site.city} e região. Solicite seu orçamento.`;
    const path = `/solucoes/${solution.slug}`;

    return {
        title,
        description,
        alternates: { canonical: path },
        openGraph: {
            type: 'website',
            locale: 'pt_BR',
            url: path,
            siteName: site.fullName,
            title,
            description,
            images: [{ url: solution.blocks[0].image, alt: solution.blocks[0].imageAlt }],
        },
    };
}

function BlockText({ block, index }: { block: SolutionBlock; index: number }) {
    return (
        <section className={`solution-block${index % 2 ? ' solution-block--reverse' : ''}`}>
            <div className="solution-block__copy" data-scroll-reveal data-reveal="up">
                <h2>{block.title}</h2>
                {block.subtitle ? <p className="solution-block__subtitle">{block.subtitle}</p> : null}
                {block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <div className="solution-block__media" data-scroll-reveal data-reveal="up" data-reveal-delay="1">
                <Image
                    src={block.image}
                    alt={block.imageAlt}
                    fill
                    sizes="(min-width: 900px) 45vw, 100vw"
                    className="object-cover"
                />
            </div>
        </section>
    );
}

function BlockLines({ block }: { block: SolutionBlock }) {
    return (
        <section className="solution-lines" aria-label={`Linhas de ${block.title}`} data-scroll-reveal data-reveal="up">
            <h3>{block.listTitle}</h3>
            <div className="solution-lines__groups">
                {block.groups.map((group) => (
                    <div className="solution-lines__group" key={group.name ?? block.title}>
                        {group.name ? <h4>{group.name}</h4> : null}
                        <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default async function SolutionPage({ params }: PageProps) {
    const { slug } = await params;
    const solution = getSolution(slug);
    if (!solution) notFound();

    const budgetUrl = whatsappLinkFor(solution.topic);
    const others = solutions.filter((other) => other.slug !== solution.slug);

    // Texto e lista de cada bloco, com o botão de orçamento exatamente no meio da página.
    const segments: ReactNode[] = solution.blocks.flatMap((block, index) => [
        <BlockText block={block} index={index} key={`${block.title}-text`} />,
        <BlockLines block={block} key={`${block.title}-lines`} />,
    ]);
    segments.splice(
        segments.length / 2,
        0,
        <aside className="popular-services__cta solution-budget" id="orcar" key="budget" aria-label={`Orçamento de ${solution.title}`} data-scroll-reveal data-reveal="up">
            <span>
                <small>Pronto para orçar?</small>
                <strong>Fale com um representante e receba seu orçamento de {solution.topic}.</strong>
            </span>
            <a className="brand-button" href={budgetUrl} {...ctaLinkProps}>
                Orçar {solution.topic} <ArrowRightUpIcon aria-hidden="true" />
            </a>
        </aside>,
    );

    return (
        <main id="topo" className="owner-home">
            <SiteMotion />
            <OwnerNavigation contactUrl={ctaUrl} basePath="/" />

            <header id="inicio" className="solution-hero">
                <div className="solution-hero__inner">
                    <nav aria-label="Você está em" className="solution-hero__crumbs">
                        <a href="/">Início</a>
                        <span aria-hidden="true">/</span>
                        <a href="/#servicos">Soluções</a>
                        <span aria-hidden="true">/</span>
                        <span aria-current="page">{solution.title}</span>
                    </nav>
                    <h1>{solution.title}</h1>
                    <p>{solution.tagline}</p>
                </div>
            </header>

            <div className="solution-content">{segments}</div>

            <nav className="solution-others" aria-labelledby="solution-others-title">
                <h2 id="solution-others-title">Conheça as outras soluções</h2>
                <ul>
                    {others.map((other) => (
                        <li key={other.slug}>
                            <a href={`/solucoes/${other.slug}`}>
                                {other.title} <ArrowRightUpIcon aria-hidden="true" />
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <SiteFooter basePath="/" />
            <FloatingContact />
        </main>
    );
}
