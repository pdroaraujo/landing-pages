import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';

const REPEAT = 50;

export type SlotReelHandle = {
  /** gira e para no índice alvo; resolve quando terminar */
  spinTo: (targetIndex: number) => Promise<void>;
};

type Props = {
  items: string[];
  itemHeight?: number;
  /** offset de início do easing entre reels, em ms */
  className?: string;
};

const SlotReel = forwardRef<SlotReelHandle, Props>(function SlotReel(
  { items, itemHeight = 72, className = '' },
  ref,
) {
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [spinning, setSpinning] = useState(false);

  const len = items.length;
  const strip = Array.from({ length: REPEAT }, () => items).flat();

  const spinTo = useCallback(
    (targetIndex: number) =>
      new Promise<void>((resolve) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const start = offsetRef.current;
        const startK = Math.round(-start / itemHeight);
        const loops = 10 + Math.floor(Math.random() * 6);
        const delta = (((targetIndex - startK) % len) + len) % len;
        const finalK = startK + loops * len + delta;
        const target = -finalK * itemHeight;
        const dist = target - start; // sempre negativo
        const dur = 2800 + Math.random() * 900;
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
            // normaliza para a primeira volta, visualmente idêntico
            const norm = -(targetIndex * itemHeight);
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

  // índice "central" atual para destacar
  const centerIdx = Math.round(-offset / itemHeight) % items.length;
  const norm = ((centerIdx % items.length) + items.length) % items.length;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] ${className}`}
      style={{ height: itemHeight * 3 }}
    >
      {/* linha central destacada */}
      <div
        className="pointer-events-none absolute inset-x-0 z-10 border-y border-[#fe0000]/40 bg-[#fe0000]/[0.06]"
        style={{ top: itemHeight, height: itemHeight }}
      />
      {/* fades topo/base */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1/3 bg-gradient-to-b from-[#0f0f0f] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/3 bg-gradient-to-t from-[#0f0f0f] to-transparent" />

      <div
        style={{
          transform: `translateY(${offset + itemHeight}px)`,
          filter: spinning ? 'blur(1.2px)' : 'none',
        }}
      >
        {strip.map((label, i) => {
          const active = !spinning && i % items.length === norm;
          return (
            <div
              key={i}
              style={{ height: itemHeight }}
              className={`flex items-center justify-center px-4 text-center font-bold tracking-tighter transition-colors ${
                active ? 'text-[#fe0000] text-2xl md:text-3xl' : 'text-white/35 text-xl md:text-2xl'
              }`}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default SlotReel;
