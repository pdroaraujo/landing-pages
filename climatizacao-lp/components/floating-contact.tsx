'use client';

import { useEffect, useState } from 'react';

export function FloatingContact({ contactUrl }: { contactUrl: string }) {
    const [isContactVisible, setIsContactVisible] = useState(false);

    useEffect(() => {
        const contact = document.querySelector('#contato');
        if (!contact) return;

        const observer = new IntersectionObserver(
            ([entry]) => setIsContactVisible(entry.isIntersecting),
            { threshold: 0.08 },
        );

        observer.observe(contact);
        return () => observer.disconnect();
    }, []);

    return (
        <a
            className={`floating-contact${isContactVisible ? ' floating-contact--hidden' : ''}`}
            href={contactUrl}
            aria-label="Ir para a área de contato"
            aria-hidden={isContactVisible}
            tabIndex={isContactVisible ? -1 : 0}
        >
            <span className="floating-contact__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16v14H8l-4 3V4Z" /><path d="M8 9h8M8 13h5" />
                </svg>
            </span>
            <span className="floating-contact__label">Contato</span>
        </a>
    );
}
