'use client';

import { useEffect, useState } from 'react';
import { privacy } from '@/lib/site-config';

const COOKIE_NOTICE_KEY = privacy.noticeKey;

/**
 * Aviso informativo de privacidade. O site não grava cookies, então não há o que
 * aceitar ou recusar: o aviso só informa e leva à política. Se o site passar a usar
 * cookies não essenciais (ex.: analytics), troque por um aviso com consentimento.
 */
export function CookieNotice() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        try {
            setIsVisible(window.localStorage.getItem(COOKIE_NOTICE_KEY) !== '1');
        } catch {
            setIsVisible(true);
        }
    }, []);

    if (!isVisible) return null;

    const dismiss = () => {
        try {
            window.localStorage.setItem(COOKIE_NOTICE_KEY, '1');
        } catch {
            // Sem armazenamento disponível: só esconde nesta visita.
        }
        setIsVisible(false);
    };

    return (
        <section className="cookie-notice" aria-label="Aviso de privacidade">
            <p>
                Este site não usa cookies de rastreamento nem de publicidade. Veja como tratamos seus dados na{' '}
                <a href="/politica-de-privacidade">Política de Privacidade e Cookies</a>.
            </p>
            <button type="button" onClick={dismiss}>Entendi</button>
        </section>
    );
}
