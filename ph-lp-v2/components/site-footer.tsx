import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import Image from 'next/image';
import { externalLink, fullAddress, phoneUrl, photos, site, whatsappUrl } from '@/lib/site-config';

/** Rodapé usado em todas as páginas: faixa de conversão + ficha de contato. */
export function SiteFooter() {
    return (
        <footer className="site-footer">
            <section className="footer-cta" aria-labelledby="footer-cta-title">
                <Image src={photos.patio} alt="Pátio de containers ao entardecer" fill sizes="100vw" className="footer-cta__image" />
                <div className="footer-cta__shade" aria-hidden="true" />
                <svg className="footer-cta__top-curve" viewBox="0 0 1600 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <path className="footer-cta__top-curve-surface" d="M0 0H526C548 0 557 5 571 16L590 31C600 39 612 42 628 42H972C988 42 1000 39 1010 31L1029 16C1043 5 1052 0 1074 0H1600V0H0Z" />
                    <path className="footer-cta__top-curve-rim" d="M526 0C548 0 557 5 571 16L590 31C600 39 612 42 628 42H972C988 42 1000 39 1010 31L1029 16C1043 5 1052 0 1074 0" />
                </svg>
                <div className="footer-cta__content" data-scroll-reveal data-reveal="scale">
                    <h2 id="footer-cta-title">
                        <span className="footer-cta__title-main">Precisa de um container</span>
                        <span>essa semana?</span>
                    </h2>
                    <small>Orçamento sem compromisso, respondido no mesmo dia pelo WhatsApp.</small>
                    <a href={whatsappUrl} {...externalLink}>
                        <span className="footer-cta__button-label">Pedir orçamento</span>
                        <span className="footer-cta__button-icon" aria-hidden="true"><ArrowRightUpIcon /></span>
                    </a>
                </div>
            </section>

            <div id="contato" className="ph-footer">
                <div className="ph-footer__inner">
                    <div className="ph-footer__brand">
                        <a href="/" aria-label="PH Container — início">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo-branco.webp" alt="PH Container" width={375} height={318} />
                        </a>
                        <p>Locação de containers e caminhão Munck no Vale do Paraíba desde {site.since}.</p>
                    </div>

                    <div className="ph-footer__col">
                        <h3>Contato</h3>
                        <a href={whatsappUrl} {...externalLink}>WhatsApp {site.phone}</a>
                        <a href={phoneUrl}>Ligar {site.phone}</a>
                        <a href={`mailto:${site.email}`}>{site.email}</a>
                        <a href={site.instagram} {...externalLink}>Instagram {site.instagramHandle}</a>
                    </div>

                    <div className="ph-footer__col">
                        <h3>Endereço</h3>
                        <a href={site.mapsUrl} {...externalLink}>
                            {site.address.street}<br />
                            {site.address.district}, {site.address.city} - {site.address.state}<br />
                            {site.address.zip}
                        </a>
                        <span>{site.hours}</span>
                    </div>

                    <div className="ph-footer__col">
                        <h3>Navegação</h3>
                        <a href="/#servicos">Serviços</a>
                        <a href="/cidades/">Cidades atendidas</a>
                        <a href="/sobre/">Sobre a PH</a>
                        <a href="/politica-de-privacidade/">Política de privacidade</a>
                    </div>

                    <a className="ph-footer__review" href={site.reviewUrl} {...externalLink} data-track="avaliar">
                        <span aria-hidden="true">★★★★★</span>
                        <strong>Avalie a PH no Google</strong>
                        <small>Sua avaliação ajuda mais clientes do Vale a encontrar a gente.</small>
                    </a>
                </div>

                <div className="ph-footer__bottom">
                    <p>© {new Date().getFullYear()} {site.name}. Todos os direitos reservados. <span className="sr-only">{fullAddress}</span></p>
                    <p>
                        Feito por <a href="https://agencias7.com.br" {...externalLink}>Agência S7</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
