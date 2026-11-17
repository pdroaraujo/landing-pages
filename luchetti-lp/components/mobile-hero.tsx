import Image from 'next/image';
import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import { ctaLinkProps, photos, site } from '@/lib/site-config';
import { RedSwoosh } from './red-swoosh';


export function MobileHero({ contactUrl }: { contactUrl: string }) {
    return (
        <div className="mobile-hero">
            <div className="mobile-hero__intro">
                <h1>
                    <span className="mobile-hero__headline">Hidráulica e</span>
                    <span className="mobile-hero__headline">impermeabilização</span>
                    <span className="mobile-hero__headline">para a sua obra.</span>
                    <RedSwoosh className="red-swoosh mobile-hero__swoosh" />
                </h1>
                <p>Distribuidor técnico em {site.city}, desde {site.since}.</p>
            </div>

            <div className="mobile-hero__scene">
                <div className="mobile-hero__image">
                    <Image src={photos.hero} alt="Vendedor atendendo cliente no balcão de loja de materiais hidráulicos" fill priority sizes="(max-width: 700px) 90vw, 1px" />
                </div>
                <div className="mobile-hero__tag mobile-hero__tag--care" aria-hidden="true">Tubos e conexões<span /></div>
                <div className="mobile-hero__proof">
                    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 3L27 7V15C27 22 22 27 16 29C10 27 5 22 5 15V7L16 3Z" stroke="currentColor" strokeWidth="1.5" /><path d="M10 16L14 20L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span>Desde<br />{site.since}.</span>
                </div>
            </div>

            <a className="mobile-hero__budget" href={contactUrl} {...ctaLinkProps}>
                <span>Solicitar orçamento</span><b><ArrowRightUpIcon aria-hidden="true" /></b>
            </a>
        </div>
    );
}
