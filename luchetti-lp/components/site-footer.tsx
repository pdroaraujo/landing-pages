import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import Image from 'next/image';
import {
    contactIsWhatsapp,
    ctaLinkProps,
    ctaUrl,
    externalLink,
    mapsUrl,
    phoneUrl,
    photos,
    site,
    whatsappUrl,
} from '@/lib/site-config';

/** Rodapé do site. Fora da home, `basePath="/"` faz as âncoras voltarem para a home. */
export function SiteFooter({ basePath = '' }: { basePath?: string }) {
    return (
        <footer className="site-footer">
            <section className="footer-cta" aria-labelledby="footer-cta-title">
                <Image
                    src={photos.footer}
                    alt="Fachada de loja de materiais de construção ao entardecer"
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
                        <span className="footer-cta__title-main">Obra sem vazamento</span>
                        <span>começa aqui.</span>
                    </h2>
                    <small>
                        Fale com um representante e receba seu orçamento
                        de hidráulica e impermeabilização.
                    </small>
                    <a href={ctaUrl} {...ctaLinkProps}>
                        <span className="footer-cta__button-label">Solicitar orçamento</span>
                        <span className="footer-cta__button-icon" aria-hidden="true"><ArrowRightUpIcon /></span>
                    </a>
                </div>
            </section>

            <div id="rodape" className="footer-main">
                <div className="footer-main__inner">
                    <div className="footer-main__compact" data-scroll-reveal data-reveal="up">
                        <div className="footer-brand">
                            <a href={`${basePath}#topo`} aria-label={`${site.name} — voltar ao início`} className="footer-brand__name footer-brand__logo">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/logo-luchetti-branco.webp" alt={site.fullName} width={245} height={95} />
                            </a>
                            <p>
                                Distribuidor técnico Amanco Wavin<br />
                                {site.city} · desde {site.since}
                            </p>
                        </div>

                        <a
                            id="contato"
                            className="footer-contact"
                            href={contactIsWhatsapp ? whatsappUrl : phoneUrl}
                            {...(contactIsWhatsapp ? externalLink : {})}
                        >
                            <span className="footer-contact__copy">
                                <small>{contactIsWhatsapp ? 'WhatsApp e telefone' : 'Fale com a Luchetti'}</small>
                                <strong>{site.phone}</strong>
                                <span>{contactIsWhatsapp ? 'Chame no WhatsApp e receba seu orçamento.' : 'Toque para ligar e pedir seu orçamento.'}</span>
                            </span>
                            <span className="footer-contact__arrow" aria-hidden="true"><ArrowRightUpIcon /></span>
                        </a>
                    </div>

                    <div className="footer-main__utility" data-scroll-reveal data-reveal="up" data-reveal-delay="1">
                        <nav className="footer-nav" aria-label="Navegação do rodapé">
                            <a href={`${basePath}#historia`}>Nossa história</a>
                            <a href={`${basePath}#servicos`}>Soluções</a>
                            <a href={`${basePath}#aplicacoes`}>Quem atendemos</a>
                            <a href={`${basePath}#duvidas`}>Dúvidas</a>
                            <a href={site.instagram} {...externalLink}>Instagram</a>
                            <a href={site.facebook} {...externalLink}>Facebook</a>
                            <a href={site.linkedin} {...externalLink}>LinkedIn</a>
                            <a href={site.youtube} {...externalLink}>YouTube</a>
                            <a href={`mailto:${site.email}`}>{site.email}</a>
                        </nav>

                        <a className="footer-location" href={mapsUrl} {...externalLink}>
                            {site.address.street} · {site.address.district} · {site.address.city}/{site.address.state}
                        </a>
                        {site.storeHours ? <span className="footer-location">{site.storeHours}</span> : null}
                    </div>

                    <div id="rodape-fim" className="footer-main__bottom" data-scroll-reveal data-reveal="up" data-reveal-delay="2">
                        <p>© {new Date().getFullYear()} {site.legalName} · CNPJ {site.cnpj}</p>
                        <div>
                            <a href={`${basePath}#topo`}>Voltar ao topo <ArrowRightUpIcon /></a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
