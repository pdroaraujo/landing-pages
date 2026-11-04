'use client';

import { useLayoutEffect } from 'react';

export function SiteMotion() {
    useLayoutEffect(() => {
        const elements = Array.from(
            document.querySelectorAll<HTMLElement>('[data-scroll-reveal]'),
        );
        const pending = new Set(elements);
        let frame = 0;

        // The root reveal class is rendered by the server, so hidden elements
        // already have their initial state before the browser's first paint.
        // Cleaning stale imperative classes still makes Fast Refresh replay.
        elements.forEach((element) => element.classList.remove('is-revealed'));

        const reveal = (element: HTMLElement) => {
            if (!pending.has(element)) return;

            element.classList.add('is-revealed');
            pending.delete(element);
        };

        const revealElementsInReadingArea = () => {
            frame = 0;
            const viewportHeight = window.innerHeight;
            const triggerLine = viewportHeight * 0.9;

            pending.forEach((element) => {
                if (!element.isConnected) {
                    pending.delete(element);
                    return;
                }

                const rect = element.getBoundingClientRect();
                const reachedReadingArea = rect.top <= triggerLine;
                const isStillOnScreen = rect.bottom >= 0;

                if (reachedReadingArea && isStillOnScreen) reveal(element);
            });
        };

        const scheduleCheck = () => {
            if (frame) return;
            frame = window.requestAnimationFrame(revealElementsInReadingArea);
        };

        const observer = 'IntersectionObserver' in window
            ? new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return;

                        scheduleCheck();
                    });
                },
                { threshold: 0, rootMargin: '0px' },
            )
            : null;

        elements.forEach((element) => observer?.observe(element));
        window.addEventListener('scroll', scheduleCheck, { passive: true });
        window.addEventListener('resize', scheduleCheck);
        window.addEventListener('hashchange', scheduleCheck);
        window.addEventListener('popstate', scheduleCheck);
        window.addEventListener('pageshow', scheduleCheck);
        window.addEventListener('load', scheduleCheck);

        // Run synchronously in the layout phase. CSS keyframes supply their own
        // initial frame, so an artificial two-frame pause is unnecessary and
        // was visible as a hitch after refresh.
        revealElementsInReadingArea();
        void document.fonts?.ready.then(scheduleCheck);

        return () => {
            observer?.disconnect();
            window.removeEventListener('scroll', scheduleCheck);
            window.removeEventListener('resize', scheduleCheck);
            window.removeEventListener('hashchange', scheduleCheck);
            window.removeEventListener('popstate', scheduleCheck);
            window.removeEventListener('pageshow', scheduleCheck);
            window.removeEventListener('load', scheduleCheck);
            if (frame) window.cancelAnimationFrame(frame);
            elements.forEach((element) => element.classList.remove('is-revealed'));
        };
    }, []);

    return null;
}
