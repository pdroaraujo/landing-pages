import { useMemo } from 'react';

type Point = { label: string; value: number };

const w = 1000;
const pad = { t: 16, r: 8, b: 24, l: 8 };

export default function AreaChart({ data, height = 260 }: { data: Point[]; height?: number }) {
  const h = height;

  const { path, area, max } = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.value));
    const innerW = w - pad.l - pad.r;
    const innerH = h - pad.t - pad.b;
    const step = data.length > 1 ? innerW / (data.length - 1) : 0;
    const pts = data.map((d, i) => {
      const x = pad.l + i * step;
      const y = pad.t + innerH - (d.value / max) * innerH;
      return [x, y] as const;
    });
    const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const areaPath = `${line} L${pad.l + (data.length - 1) * step},${pad.t + innerH} L${pad.l},${pad.t + innerH} Z`;
    return { path: line, area: areaPath, max };
  }, [data, h]);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id="s7fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fe0000" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fe0000" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1={pad.l}
            x2={w - pad.r}
            y1={pad.t + (h - pad.t - pad.b) * g}
            y2={pad.t + (h - pad.t - pad.b) * g}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}
        <path d={area} fill="url(#s7fill)" />
        <path d={path} fill="none" stroke="#fe0000" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="mt-2 flex justify-between px-1 text-[10px] uppercase tracking-widest text-white/30">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
      <span className="sr-only">Máximo: {max}</span>
    </div>
  );
}
