import Image from 'next/image';
import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import { externalLink, photos, site, whatsappUrl } from '@/lib/site-config';

const shortcuts = [
    { label: 'Containers e Munck', href: '#servicos', image: photos.escritorio },
    { label: 'Como funciona', href: '#como-funciona', image: photos.hero },
    { label: 'Cidades atendidas', href: '#cidades', image: photos.obra },
];

export function MobileHero() {
    return (
        <div className="mobile-hero">
            <div className="mobile-hero__intro">
                <p className="mobile-hero__kicker">Desde {site.since} · Jacareí/SP</p>
                <p className="mobile-hero__title" role="heading" aria-level={1}>
                    <span className="mobile-hero__ribbon">Containers</span>
                    <span className="mobile-hero__ribbon mobile-hero__ribbon--reverse">e Munck</span>
                    <span className="mobile-hero__headline">no Vale do Paraíba.</span>
                </p>
                <p>Locação de container escritório, almoxarifado e sanitário, com entrega por Munck próprio.</p>
            </div>

            <div className="mobile-hero__scene">
                <div className="mobile-hero__image">
                    <Image src={photos.hero} alt="Caminhão Munck posicionando um container escritório" fill sizes="(max-width: 700px) 90vw, 1px" />
                </div>
                <div className="mobile-hero__tag mobile-hero__tag--care" aria-hidden="true">Munck próprio<span /></div>
                <div className="mobile-hero__proof">
                    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="4" y="9" width="24" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M9 9V24M14 9V24M19 9V24M24 9V24" stroke="currentColor" strokeWidth="1.2" /></svg>
                    <span>+30 anos<br />de Vale.</span>
                </div>
            </div>

            <nav className="mobile-hero__shortcuts" aria-label="Atalhos da página">
                {shortcuts.map(({ label, href, image }) => (
                    <a key={href} href={href}>
                        <Image src={image} alt="" width={42} height={42} />
                        <span>{label}</span><b aria-hidden="true">›</b>
                    </a>
                ))}
            </nav>
            <a className="mobile-hero__budget" href={whatsappUrl} {...externalLink}>
                <span>Pedir orçamento</span><b><ArrowRightUpIcon aria-hidden="true" /></b>
            </a>
        </div>
    );
}
