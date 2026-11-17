'use client';

import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import { useEffect, useState } from 'react';
import { externalLink, whatsappUrl } from '@/lib/site-config';

// Links absolutos ("/#...") para funcionarem também nas páginas internas.
const navigationItems = [
    { href: '/#servicos', label: 'Serviços' },
    { href: '/#como-funciona', label: 'Como funciona' },
    { href: '/cidades/', label: 'Cidades' },
    { href: '/sobre/', label: 'Sobre' },
    { href: '/#duvidas', label: 'Dúvidas' },
];

export function OwnerNavigation() {
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
                <a href="/" className="owner-nav__brand" aria-label="PH Container — início" onClick={closeMenu}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.webp" alt="PH Container" width={375} height={318} />
                </a>
                <a href={whatsappUrl} {...externalLink} className="owner-nav__contact" aria-label="Pedir orçamento pelo WhatsApp">
                    <span>Pedir orçamento</span>
                    <span className="owner-nav__contact-icon"><ArrowRightUpIcon aria-hidden="true" /></span>
                </a>
                <button
                    type="button"
                    className="owner-nav__mobile-toggle"
                    aria-label={isOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
                    aria-controls="owner-mobile-menu"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((current) => !current)}
                >
                    <svg viewBox="0 0 28 28" aria-hidden="true">
                        <path className="owner-nav__toggle-line owner-nav__toggle-line--top" d="M5 10H23" />
                        <path className="owner-nav__toggle-line owner-nav__toggle-line--bottom" d="M5 18H23" />
                    </svg>
                </button>
            </div>

            <nav aria-label="Navegação principal" className="owner-nav__links">
                {navigationItems.map((item) => <a className="owner-nav__section-link" key={item.href} href={item.href}>{item.label}</a>)}
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
                    <a href={whatsappUrl} {...externalLink} className="owner-nav__mobile-contact" onClick={closeMenu} tabIndex={isOpen ? 0 : -1}>
                        <span><small>WhatsApp</small>Pedir orçamento</span>
                        <b aria-hidden="true"><ArrowRightUpIcon /></b>
                    </a>
                </div>
            </div>
        </header>
    );
}
