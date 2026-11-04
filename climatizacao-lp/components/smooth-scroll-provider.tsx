'use client';

import { ReactLenis } from 'lenis/react';
import type { LenisOptions } from 'lenis';
import type { ReactNode } from 'react';

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
    return (
        <ReactLenis root options={lenisOptions}>
            {children}
        </ReactLenis>
    );
}
