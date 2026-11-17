'use client';

import {
    useLayoutEffect,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
} from 'react';

type ScrollRevealSectionProps = {
    children: ReactNode;
    className: string;
    cursorTargetSelector?: string;
    id: string;
    reveal?: boolean;
};

export function ScrollRevealSection({
    children,
    className,
    cursorTargetSelector = '.service-card',
    id,
    reveal = true,
}: ScrollRevealSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useLayoutEffect(() => {
        if (!reveal) return;

        const section = sectionRef.current;
        if (!section) return;
        let frame = 0;
        let revealed = false;
        let observer: IntersectionObserver | null = null;

        const revealIfInReadingArea = () => {
            frame = 0;
            if (revealed) return;

            const rect = section.getBoundingClientRect();
            const reachedReadingArea = rect.top <= window.innerHeight * 0.9;
            const isStillOnScreen = rect.bottom >= 0;

            if (!reachedReadingArea || !isStillOnScreen) return;

            revealed = true;
            setIsVisible(true);
            observer?.disconnect();
        };

        const scheduleCheck = () => {
            if (frame || revealed) return;
            frame = window.requestAnimationFrame(revealIfInReadingArea);
        };

        observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;

                scheduleCheck();
            },
            { threshold: 0, rootMargin: '0px' },
        );

        observer.observe(section);
        window.addEventListener('scroll', scheduleCheck, { passive: true });
        window.addEventListener('resize', scheduleCheck);
        window.addEventListener('hashchange', scheduleCheck);
        window.addEventListener('pageshow', scheduleCheck);
        window.addEventListener('load', scheduleCheck);
        revealIfInReadingArea();
        void document.fonts?.ready.then(scheduleCheck);

        return () => {
            observer?.disconnect();
            window.removeEventListener('scroll', scheduleCheck);
            window.removeEventListener('resize', scheduleCheck);
            window.removeEventListener('hashchange', scheduleCheck);
            window.removeEventListener('pageshow', scheduleCheck);
            window.removeEventListener('load', scheduleCheck);
            if (frame) window.cancelAnimationFrame(frame);
        };
    }, [reveal]);

    const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
        if (event.pointerType !== 'mouse') return;

        const cursor = cursorRef.current;
        const target = event.target;
        if (!cursor || !(target instanceof Element)) return;

        const isOverTarget = Boolean(target.closest(cursorTargetSelector));
        cursor.dataset.visible = String(isOverTarget);

        if (!isOverTarget) return;

        cursor.style.setProperty('--cursor-x', `${event.clientX}px`);
        cursor.style.setProperty('--cursor-y', `${event.clientY}px`);
    };

    const handlePointerLeave = () => {
        if (cursorRef.current) {
            cursorRef.current.dataset.visible = 'false';
        }
    };

    return (
        <section
            ref={sectionRef}
            id={id}
            className={`${className}${reveal ? ` popular-services--reveal-ready${isVisible ? ' popular-services--visible' : ''}` : ''}`}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
        >
            {children}
            <div
                ref={cursorRef}
                className="service-card-cursor"
                data-visible="false"
                aria-hidden="true"
            >
                <svg className="service-card-cursor__orbit" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="31" />
                </svg>
                <svg className="service-card-cursor__arrow" viewBox="0 0 24 24">
                    <path d="M7 17 17 7M9 7h8v8" />
                </svg>
            </div>
        </section>
    );
}
