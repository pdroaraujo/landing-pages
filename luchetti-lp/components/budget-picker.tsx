'use client';

import { ArrowRightUpIcon } from '@solar-icons/react/bold/arrow-right-up';
import { useEffect, useId, useRef, useState } from 'react';
import { ctaLinkProps, ctaUrl } from '@/lib/site-config';
import { solutions } from '@/lib/solutions';

/** Botão de orçamento da home: abre a lista de linhas e leva à página de cada uma. */
export function BudgetPicker() {
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuId = useId();

    useEffect(() => {
        if (!isOpen) return;

        menuRef.current?.scrollIntoView({ block: 'nearest' });

        const closeOnOutsideClick = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            setIsOpen(false);
            buttonRef.current?.focus();
        };

        document.addEventListener('pointerdown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [isOpen]);

    return (
        <div className="budget-picker" ref={rootRef}>
            <button
                ref={buttonRef}
                type="button"
                className="brand-button"
                aria-expanded={isOpen}
                aria-controls={menuId}
                onClick={() => setIsOpen((current) => !current)}
            >
                Solicitar orçamento <ArrowRightUpIcon aria-hidden="true" />
            </button>

            <div id={menuId} ref={menuRef} className="budget-picker__menu" hidden={!isOpen}>
                <p>Qual linha você quer orçar?</p>
                <ul>
                    {solutions.map((solution) => (
                        <li key={solution.slug}>
                            <a href={`/solucoes/${solution.slug}`}>
                                {solution.title} <ArrowRightUpIcon aria-hidden="true" />
                            </a>
                        </li>
                    ))}
                    <li>
                        <a className="budget-picker__general" href={ctaUrl} {...ctaLinkProps}>
                            Ainda não sei a linha: falar com um representante
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
