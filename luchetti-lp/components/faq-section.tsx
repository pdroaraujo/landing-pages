'use client';

import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import { useLayoutEffect, useRef, useState } from 'react';
import { ctaLinkProps, site } from '@/lib/site-config';

const faqItems = [
    {
        question: 'Quem a Luchetti atende?',
        answer:
            'Construtoras, empreiteiras, profissionais da construção e também clientes finais. Empresas contam com atendimento especializado e condições para o seu perfil.',
    },
    {
        question: 'Quais marcas vocês trabalham?',
        answer:
            `Somos distribuidor técnico Amanco Wavin e trabalhamos com marcas referência como ${site.brands.slice(1).join(", ")}, entre outras. Consulte a disponibilidade do item que você precisa.`,
    },
    {
        question: 'Vocês ajudam a especificar o material da obra?',
        answer:
            'Sim. Temos atendimento especializado para engenheiros e arquitetos, com orientação técnica em hidráulica, drenagem e impermeabilização.',
    },
    {
        question: 'Quais linhas de produto vocês têm?',
        answer:
            `São cerca de ${site.products} itens em hidráulica, impermeabilização e linha técnica, gás, PCI (combate a incêndio), AVAC e acabamentos.`,
    },
    {
        question: 'Como peço um orçamento?',
        answer: `Mande a lista de materiais ou o projeto pelo WhatsApp ${site.phone} ou para ${site.email}. Um representante responde com a cotação e tira as dúvidas técnicas.`,
    },
    {
        question: 'Onde fica a loja?',
        answer:
            `Na ${site.address.street}, ${site.address.district}, em ${site.address.city}/${site.address.state}. Atendemos ${site.region}.`,
    },
];

export function FaqSection({ contactUrl }: { contactUrl: string }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const answerRefs = useRef<Array<HTMLElement | null>>([]);

    useLayoutEffect(() => {
        const updateMeasurements = () => {
            answerRefs.current.forEach((panel) => {
                if (!panel) return;

                const answerHeight = panel.scrollHeight;
                const item = panel.closest<HTMLElement>('.faq-item');
                const question = item?.querySelector<HTMLElement>('.faq-question');

                panel.style.setProperty('--faq-answer-height', `${answerHeight}px`);

                if (item && question) {
                    const width = item.getBoundingClientRect().width;
                    const expandedHeight = question.offsetHeight + answerHeight;
                    const radius = Math.min(15, width / 2, expandedHeight / 2);
                    const traceLength = 2 * (width + expandedHeight - 4 * radius) + 2 * Math.PI * radius;

                    item.style.setProperty('--faq-expanded-height', `${expandedHeight}px`);
                    item.querySelectorAll<SVGRectElement>('.faq-item__led-outline rect').forEach((trace) => {
                        trace.style.setProperty('--faq-led-length', `${traceLength}`);
                    });
                }
            });
        };

        updateMeasurements();

        const resizeObserver = new ResizeObserver(updateMeasurements);
        answerRefs.current.forEach((panel) => {
            const answer = panel?.firstElementChild;
            if (answer) resizeObserver.observe(answer);
        });

        return () => resizeObserver.disconnect();
    }, []);

    return (
        <section
            id="duvidas"
            className={`faq-section${openIndex !== null ? ' faq-section--expanded' : ''}`}
        >
            <div className="faq-section__shell">
                <div className="faq-section__inner">
                    <header className="faq-section__heading" data-scroll-reveal data-reveal="up">
                        <p className="section-label"><span aria-hidden="true">/</span>Dúvidas frequentes</p>
                        <h2>Respostas para as dúvidas mais comuns</h2>
                    </header>

                    <div className="faq-list">
                        {faqItems.map((item, index) => {
                            const isOpen = openIndex === index;
                            const answerId = `faq-answer-${index}`;
                            const questionId = `faq-question-${index}`;

                            return (
                                <div
                                    className="faq-item-reveal"
                                    key={item.question}
                                    data-scroll-reveal
                                    data-reveal="up"
                                    data-reveal-delay={String(Math.min(index + 1, 4))}
                                >
                                    <article
                                        className={`faq-item${isOpen ? ' faq-item--open' : ''}`}
                                    >
                                        <svg
                                            className="faq-item__led-outline"
                                            aria-hidden="true"
                                            focusable="false"
                                        >
                                            <rect className="faq-item__led-glow" />
                                            <rect className="faq-item__led-core" />
                                        </svg>
                                        <button
                                            id={questionId}
                                            className="faq-question"
                                            type="button"
                                            aria-expanded={isOpen}
                                            aria-controls={answerId}
                                            onClick={() => setOpenIndex(isOpen ? null : index)}
                                        >
                                            <span>{item.question}</span>
                                            <span className="faq-list__icon" aria-hidden="true">
                                                <svg viewBox="0 0 24 24" focusable="false">
                                                    <path className="faq-icon__horizontal" d="M6 12H18" />
                                                    <path className="faq-icon__vertical" d="M12 6V18" />
                                                </svg>
                                            </span>
                                        </button>

                                        <section
                                            ref={(node) => {
                                                answerRefs.current[index] = node;
                                            }}
                                            id={answerId}
                                            className="faq-answer-grid"
                                            aria-labelledby={questionId}
                                            aria-hidden={!isOpen}
                                        >
                                            <div className="faq-answer">
                                                <p>{item.answer}</p>
                                            </div>
                                        </section>
                                    </article>
                                </div>
                            );
                        })}
                    </div>

                    <div className="faq-section__cta" data-scroll-reveal data-reveal="up">
                        <span>
                            <small>Não encontrou sua resposta?</small>
                            <strong>Fale direto com o nosso time.</strong>
                        </span>
                        <a href={contactUrl} {...ctaLinkProps}>
                            Falar com a Luchetti
                            <b aria-hidden="true"><ArrowRightUpIcon /></b>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
