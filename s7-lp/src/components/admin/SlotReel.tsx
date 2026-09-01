import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';

export type SlotReelHandle = {
  /** gira e para no índice alvo; resolve quando terminar */
  spinTo: (targetIndex: number) => Promise<void>;
};

type Props = {
  items: string[];
  itemHeight?: number;
  className?: string;
};

const BUFFER = 2; // linhas extras acima/abaixo da janela visível

const SlotReel = forwardRef<SlotReelHandle, Props>(function SlotReel(
  { items, itemHeight = 72, className = '' },
  ref,
) {
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [spinning, setSpinning] = useState(false);

  const len = Math.max(1, items.length);

  const spinTo = useCallback(
    (targetIndex: number) =>
      new Promise<void>((resolve) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const start = offsetRef.current;
        const startK = Math.round(-start / itemHeight);
        const loops = 12 + Math.floor(Math.random() * 6);
        const delta = (((targetIndex - startK) % len) + len) % len;
        const finalK = startK + loops * len + delta;
        const target = -finalK * itemHeight;
        const dist = target - start;
        const dur = 3000 + Math.random() * 1000;
        const t0 = performance.now();
        setSpinning(true);

        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / dur);
          const e = 1 - Math.pow(1 - p, 4); // easeOutQuart — desacelera igual caça-níquel
          const val = start + dist * e;
          offsetRef.current = val;
          setOffset(val);
          if (p < 1) {
            rafRef.current = requestAnimationFrame(tick);
          } else {
            const norm = -(((targetIndex % len) + len) % len) * itemHeight;
            offsetRef.current = norm;
            setOffset(norm);
            setSpinning(false);
            rafRef.current = null;
            resolve();
          }
        };
        rafRef.current = requestAnimationFrame(tick);
      }),
    [len, itemHeight],
  );

  useImperativeHandle(ref, () => ({ spinTo }), [spinTo]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  // janela virtual: só renderiza as linhas visíveis + buffer
  const centerK = -offset / itemHeight; // índice virtual no slot central
  const first = Math.floor(centerK) - 1 - BUFFER;
  const last = Math.ceil(centerK) + 1 + BUFFER;
  const rows: { k: number; label: string; active: boolean }[] = [];
  const activeK = Math.round(centerK);
  for (let k = first; k <= last; k++) {
    const idx = ((k % len) + len) % len;
    rows.push({ k, label: items[idx] ?? '', active: !spinning && k === activeK });
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] ${className}`}
      style={{ height: itemHeight * 3 }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 z-10 border-y border-[#fe0000]/40 bg-[#fe0000]/[0.06]"
        style={{ top: itemHeight, height: itemHeight }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1/3 bg-gradient-to-b from-[#0f0f0f] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/3 bg-gradient-to-t from-[#0f0f0f] to-transparent" />

      <div style={{ filter: spinning ? 'blur(1.2px)' : 'none' }}>
        {rows.map(({ k, label, active }) => (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: itemHeight,
              transform: `translateY(${k * itemHeight + offset + itemHeight}px)`,
            }}
            className={`flex items-center justify-center px-3 text-center font-bold tracking-tighter transition-colors ${
              active ? 'text-[#fe0000] text-xl md:text-2xl' : 'text-white/35 text-lg md:text-xl'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
});

export default SlotReel;
