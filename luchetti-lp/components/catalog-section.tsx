import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import { catalog, ctaLinkProps, whatsappLinkFor } from '@/lib/site-config';

/** Catálogo completo: todas as linhas e subcategorias do site institucional. */
export function CatalogSection() {
    return (
        <section id="catalogo" className="catalog" aria-labelledby="catalog-title">
            <div className="catalog__inner">
                <header className="catalog__heading" data-scroll-reveal data-reveal="up">
                    <p className="section-label"><span aria-hidden="true">/</span>Catálogo completo</p>
                    <h2 id="catalog-title">Nossas soluções para a sua obra</h2>
                    <p>
                        Cerca de 10 mil itens em seis linhas. Distribuidor técnico Amanco Wavin, com as marcas
                        de referência do mercado. Escolha a linha e fale direto com um representante.
                    </p>
                </header>

                <div className="catalog__grid">
                    {catalog.map((line, index) => (
                        <article
                            className="catalog-line"
                            key={line.title}
                            data-scroll-reveal
                            data-reveal="up"
                            data-reveal-delay={String((index % 3) + 1)}
                        >
                            <header>
                                <span className="catalog-line__index" aria-hidden="true">0{index + 1}</span>
                                <h3>{line.title}</h3>
                                {'subtitle' in line ? <small>{line.subtitle}</small> : null}
                            </header>
                            <p className="catalog-line__intro">{line.intro}</p>
                            {line.groups.map((group) => (
                                <div className="catalog-line__group" key={group.name}>
                                    {line.groups.length > 1 ? <h4>{group.name}</h4> : null}
                                    <ul aria-label={`${line.title}: ${group.name.toLowerCase()}`}>
                                        {group.items.map((item) => <li key={item}>{item}</li>)}
                                    </ul>
                                </div>
                            ))}
                            <a className="catalog-line__cta" href={whatsappLinkFor(line.topic)} {...ctaLinkProps}>
                                Orçar {line.topic} <ArrowRightUpIcon aria-hidden="true" />
                            </a>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
