'use client';

import { useEffect, useState } from 'react';
import { contactIsWhatsapp, ctaLinkProps, ctaUrl } from '@/lib/site-config';

export function FloatingContact() {
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
            href={ctaUrl}
            {...ctaLinkProps}
            aria-label={contactIsWhatsapp ? 'Chamar a Luchetti no WhatsApp' : 'Ir para o contato da Luchetti'}
            aria-hidden={isContactVisible}
            tabIndex={isContactVisible ? -1 : 0}
        >
            <span className="floating-contact__icon" aria-hidden="true">
                {contactIsWhatsapp ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.2 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2Zm0 17.9a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8.1 8.1 0 1 1 12 20.1Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16v14H8l-4 3V4Z" /><path d="M8 9h8M8 13h5" />
                    </svg>
                )}
            </span>
            <span className="floating-contact__label">{contactIsWhatsapp ? 'WhatsApp' : 'Orçamento'}</span>
        </a>
    );
}
