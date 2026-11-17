import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { FloatingContact } from './floating-contact';
import { OwnerNavigation } from './owner-navigation';
import { SiteFooter } from './site-footer';
import { SiteMotion } from './site-motion';
import { externalLink, photos, site, whatsappUrl } from '@/lib/site-config';
import '@/app/floating-contact.css';
import '@/app/owner-hero.css';

type Crumb = { name: string; href?: string };

/** Casca das páginas internas: menu, faixa de título, conteúdo e rodapé. */
export function Subpage({
    crumbs,
    chip,
    title,
    lead,
    image = photos.hero,
    secondaryAction,
    children,
}: {
    crumbs: Crumb[];
    chip?: string;
    title: string;
    lead?: string;
    image?: string;
    secondaryAction?: { label: string; href: string; external?: boolean };
    children: ReactNode;
}) {
    return (
        <main id="topo" className="owner-home sp">
            <SiteMotion />
            <OwnerNavigation />

            <section className="sp-hero">
                <Image src={image} alt="" fill priority sizes="100vw" className="sp-hero__image" />
                <div className="sp-hero__shade" aria-hidden="true" />
                <div id="conteudo" className="sp-hero__inner">
                    <nav className="sp-crumb" aria-label="Você está em">
                        <a href="/">Início</a>
                        {crumbs.map((c) => (
                            <span key={c.name}>
                                <span aria-hidden="true"> / </span>
                                {c.href ? <a href={c.href}>{c.name}</a> : <span aria-current="page">{c.name}</span>}
                            </span>
                        ))}
                    </nav>
                    {chip ? <p className="sp-chip">{chip}</p> : null}
                    <h1>{title}</h1>
                    {lead ? <p className="sp-lead">{lead}</p> : null}
                    <div className="sp-actions">
                        <a className="sp-btn sp-btn--primary" href={whatsappUrl} {...externalLink}>
                            Pedir orçamento no WhatsApp <ArrowRightUpIcon aria-hidden="true" />
                        </a>
                        {secondaryAction ? (
                            <a className="sp-btn sp-btn--ghost" href={secondaryAction.href} {...(secondaryAction.external ? externalLink : {})}>
                                {secondaryAction.label}
                            </a>
                        ) : null}
                    </div>
                </div>
            </section>

            {children}

            <SiteFooter />
            <FloatingContact />
        </main>
    );
}

export function StatRow({ items }: { items: { n: string; l: string }[] }) {
    return (
        <div className="sp-stats" data-scroll-reveal data-reveal="up">
            {items.map((it) => (
                <div className="sp-stat" key={it.l}>
                    <strong>{it.n}</strong>
                    <span>{it.l}</span>
                </div>
            ))}
        </div>
    );
}

export const defaultStats = (prazo?: { n: string; l: string }) => [
    { n: String(site.since), l: 'No Vale do Paraíba desde' },
    { n: `+${new Date().getFullYear() - site.since}`, l: 'Anos de operação' },
    { n: 'Própria', l: 'Frota de caminhão Munck' },
    prazo ?? { n: '39', l: 'Cidades atendidas' },
];
