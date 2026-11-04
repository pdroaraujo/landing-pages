'use client';

import { ReactLenis } from 'lenis/react';
import type { LenisOptions } from 'lenis';
import { useEffect, useState, type ReactNode } from 'react';

const lenisOptions: LenisOptions = {
    smoothWheel: true,
    lerp: 0.055,
    wheelMultiplier: 0.86,
    touchMultiplier: 1.15,
    syncTouch: false,
    overscroll: true,
    anchors: true,
    autoRaf: true,
};

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
    // Respeita "reduzir movimento" do sistema: sem rolagem suave artificial.
    const [reduceMotion, setReduceMotion] = useState(false);
    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduceMotion(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    if (reduceMotion) return <>{children}</>;

    return (
        <ReactLenis root options={lenisOptions}>
            {children}
        </ReactLenis>
    );
}
