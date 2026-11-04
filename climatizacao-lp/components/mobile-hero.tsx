import Image from 'next/image';
import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';

const shortcuts = [
    { label: 'Serviços', href: '#servicos', image: '/card-service-installation-v1.png' },
    { label: 'Aplicações', href: '#aplicacoes', image: '/card-project-bedroom-v1.png' },
    { label: 'Dúvidas', href: '#duvidas', image: '/card-project-finishing-v1.png' },
];

export function MobileHero({ contactUrl }: { contactUrl: string }) {
    return (
        <div className="mobile-hero">
            <div className="mobile-hero__intro">
                <h1>
                    <span className="mobile-hero__ribbon">Climatização</span>
                    <span className="mobile-hero__ribbon mobile-hero__ribbon--reverse">especializada.</span>
                    <span className="mobile-hero__headline">Para o seu ambiente.</span>
                </h1>
                <p>Instalação e manutenção de ar-condicionado para diferentes ambientes.</p>
            </div>

            <div className="mobile-hero__scene">
                <div className="mobile-hero__image">
                    <Image src="/hero-technician.png" alt="Profissional realizando manutenção em ar-condicionado; imagem ilustrativa" fill sizes="(max-width: 700px) 90vw, 1px" />
                </div>
                <div className="mobile-hero__tag mobile-hero__tag--care" aria-hidden="true">Cuidado técnico<span /></div>
                <div className="mobile-hero__proof">
                    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 3L27 7V15C27 22 22 27 16 29C10 27 5 22 5 15V7L16 3Z" stroke="currentColor" strokeWidth="1.5" /><path d="M10 16L14 20L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span>Cuidado<br />técnico.</span>
                </div>
            </div>

            <nav className="mobile-hero__shortcuts" aria-label="Explore o template">
                {shortcuts.map(({ label, href, image }) => (
                    <a key={href} href={href}>
                        <Image src={image} alt="" width={42} height={42} />
                        <span>{label}</span><b aria-hidden="true">›</b>
                    </a>
                ))}
            </nav>
            <a className="mobile-hero__budget" href={contactUrl}>
                <span>Ver área de contato</span><b><ArrowRightUpIcon aria-hidden="true" /></b>
            </a>
        </div>
    );
}
