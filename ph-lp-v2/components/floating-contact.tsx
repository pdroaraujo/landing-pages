'use client';

import { useEffect, useState } from 'react';
import { externalLink, whatsappUrl } from '@/lib/site-config';

/** Botão de WhatsApp fixo; some quando o bloco de contato do rodapé está na tela. */
export function FloatingContact() {
    const [isContactVisible, setIsContactVisible] = useState(false);

    useEffect(() => {
        const contact = document.querySelector('#contato');
        if (!contact) return;

        const observer = new IntersectionObserver(([entry]) => setIsContactVisible(entry.isIntersecting), { threshold: 0.08 });
        observer.observe(contact);
        return () => observer.disconnect();
    }, []);

    return (
        <a
            className={`floating-contact${isContactVisible ? ' floating-contact--hidden' : ''}`}
            href={whatsappUrl}
            {...externalLink}
            aria-label="Falar com a PH Container no WhatsApp"
            aria-hidden={isContactVisible}
            tabIndex={isContactVisible ? -1 : 0}
        >
            <span className="floating-contact__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.9.99 6.68 2.77a9.38 9.38 0 0 1 2.76 6.68c0 5.21-4.24 9.44-9.45 9.44m8.04-17.48A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.58 23.6l6-1.57a11.34 11.34 0 0 0 5.46 1.39h.01c6.26 0 11.36-5.1 11.36-11.36 0-3.03-1.18-5.89-3.33-8.03" />
                </svg>
            </span>
            <span className="floating-contact__label">WhatsApp</span>
        </a>
    );
}
