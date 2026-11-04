'use client';

import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import { useLayoutEffect, useRef, useState } from 'react';

const faqItems = [
    {
        question: 'Quais serviços podem ser apresentados aqui?',
        answer:
            'Instalação, manutenção, higienização e reparos em aparelhos de ar-condicionado. Adapte esta resposta aos serviços oferecidos.',
    },
    {
        question: 'Como saber qual capacidade de ar-condicionado é ideal?',
        answer:
            'Considere o tamanho do ambiente, incidência solar, quantidade de pessoas e equipamentos. Personalize esta orientação conforme o seu atendimento.',
    },
    {
        question: 'Com que frequência devo higienizar o aparelho?',
        answer:
            'A frequência depende do uso e do ambiente. Queda de desempenho, cheiro incomum ou acúmulo de poeira indicam que é hora de verificar.',
    },
    {
        question: 'Este modelo também serve para clientes comerciais?',
        answer:
            'Sim. A seção de serviços inclui uma opção para espaços comerciais e pode ser adaptada ao seu público.',
    },
    {
        question: 'Onde informar a região atendida?',
        answer:
            'Inclua sua cidade e área de atendimento na seção de contato antes de publicar o site.',
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
                            <strong>Personalize a área de contato do seu negócio.</strong>
                        </span>
                        <a href={contactUrl}>
                            Ver contato
                            <b aria-hidden="true"><ArrowRightUpIcon /></b>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
