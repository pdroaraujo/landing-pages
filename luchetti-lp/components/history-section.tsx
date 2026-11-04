import Image from 'next/image';
import { essence, site, timeline, yearsInBusiness } from '@/lib/site-config';

/** Nossa história (linha do tempo com acervo real) + Nossa essência. */
export function HistorySection() {
    return (
        <section id="historia" className="history" aria-labelledby="history-title">
            <div className="history__inner">
                <header className="history__heading">
                    <div data-scroll-reveal data-reveal="left">
                        <p className="section-label section-label--dark"><span aria-hidden="true">/</span>Nossa história</p>
                        <h2 id="history-title">Construindo histórias desde {site.since}.</h2>
                    </div>
                    <p className="history__intro" data-scroll-reveal data-reveal="right" data-reveal-delay="1">
                        Tipicamente brasileira, a Luchetti é fruto do encontro de duas famílias de
                        imigrantes italianos, os Luchetta e os Simon. São {yearsInBusiness} anos de empresa e,
                        hoje, a <strong>5ª geração</strong> mantém a solidez e a vanguarda de seus fundadores.
                    </p>
                </header>

                <ol className="history__timeline" data-scroll-reveal data-reveal="up" data-reveal-delay="1">
                    {timeline.map((moment) => (
                        <li className="history-moment" key={moment.year}>
                            <figure>
                                <div className="history-moment__media">
                                    <Image
                                        src={moment.image}
                                        alt={moment.alt}
                                        fill
                                        sizes="(min-width: 1100px) 16vw, (min-width: 640px) 31vw, 46vw"
                                        className="object-cover"
                                    />
                                </div>
                                <figcaption>
                                    <strong>{moment.year}</strong>
                                    <span>{moment.caption}</span>
                                </figcaption>
                            </figure>
                        </li>
                    ))}
                </ol>

                <div className="history__essence">
                    <h3 className="history__essence-title" data-scroll-reveal data-reveal="up">Nossa essência</h3>
                    <div className="history__essence-grid">
                        {essence.map((item, index) => (
                            <article
                                className="essence-card"
                                key={item.title}
                                data-scroll-reveal
                                data-reveal="up"
                                data-reveal-delay={String(index + 1)}
                            >
                                <span className="essence-card__index" aria-hidden="true">0{index + 1}</span>
                                <h4>{item.title}</h4>
                                <p>{item.text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
