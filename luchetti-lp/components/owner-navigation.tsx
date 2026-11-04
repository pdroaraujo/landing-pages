'use client';

import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import { useEffect, useState } from 'react';
import { ctaLinkProps, site } from '@/lib/site-config';

const navigationItems = [
    { href: '#destaque', label: 'A Luchetti' },
    { href: '#historia', label: 'História' },
    { href: '#catalogo', label: 'Catálogo' },
    { href: '#aplicacoes', label: 'Quem atendemos' },
    { href: '#duvidas', label: 'Dúvidas' },
];

export function OwnerNavigation({ contactUrl }: { contactUrl: string }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        const desktop = window.matchMedia('(min-width: 701px)');
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        const closeOnDesktop = (event: MediaQueryListEvent) => {
            if (event.matches) setIsOpen(false);
        };

        root.classList.toggle('mobile-menu-open', isOpen);
        window.addEventListener('keydown', closeOnEscape);
        desktop.addEventListener('change', closeOnDesktop);

        return () => {
            root.classList.remove('mobile-menu-open');
            window.removeEventListener('keydown', closeOnEscape);
            desktop.removeEventListener('change', closeOnDesktop);
        };
    }, [isOpen]);

    const closeMenu = () => setIsOpen(false);

    return (
        <header className={`owner-nav${isOpen ? ' owner-nav--menu-open' : ''}`}>
            <div className="owner-nav__top">
                <a href="#topo" className="owner-nav__brand" aria-label={`${site.name} — início`} onClick={closeMenu}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo-luchetti-verde.webp" alt={site.fullName} width={245} height={95} />
                </a>
                <a
                    href={contactUrl}
                    {...ctaLinkProps}
                    className="owner-nav__contact"
                    aria-label="Solicitar orçamento"
                >
                    <span>Solicitar orçamento</span>
                    <span className="owner-nav__contact-icon"><ArrowRightUpIcon aria-hidden="true" /></span>
                </a>
                <button
                    type="button"
                    className="owner-nav__mobile-toggle"
                    aria-label={isOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
                    aria-controls="owner-mobile-menu"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen(current => !current)}
                >
                    <svg viewBox="0 0 28 28" aria-hidden="true">
                        <path className="owner-nav__toggle-line owner-nav__toggle-line--top" d="M5 10H23" />
                        <path className="owner-nav__toggle-line owner-nav__toggle-line--bottom" d="M5 18H23" />
                    </svg>
                </button>
            </div>

            <nav aria-label="Navegação principal" className="owner-nav__links">
                {navigationItems.map(item => <a className="owner-nav__section-link" key={item.href} href={item.href}>{item.label}</a>)}
            </nav>

            <div id="owner-mobile-menu" className="owner-nav__mobile-panel" aria-hidden={!isOpen}>
                <div className="owner-nav__mobile-inner">
                    <p className="owner-nav__mobile-eyebrow"><span aria-hidden="true">/</span> Navegação</p>
                    <nav className="owner-nav__mobile-links" aria-label="Navegação mobile">
                        {navigationItems.map((item, index) => (
                            <a key={item.href} href={item.href} onClick={closeMenu} tabIndex={isOpen ? 0 : -1}>
                                <span>{item.label}</span>
                                <small aria-hidden="true">0{index + 1}</small>
                            </a>
                        ))}
                    </nav>
                    <a
                        href={contactUrl}
                        {...ctaLinkProps}
                        className="owner-nav__mobile-contact"
                        onClick={closeMenu}
                        tabIndex={isOpen ? 0 : -1}
                    >
                        <span><small>Atendimento</small>Solicitar orçamento</span>
                        <b aria-hidden="true"><ArrowRightUpIcon /></b>
                    </a>
                </div>
            </div>
        </header>
    );
}
