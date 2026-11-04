// Peças do dashboard no estilo "carteira" (card grande com gráfico brilhante,
// carteira vermelha com cartão, barras por período). Usadas pelos painéis da
// agência, do S7 Card e do cliente — mesma cara em todos.
import { useId, useMemo, type ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

import { compact, initials, PERIODS, type PeriodKey, type Pt } from '../../lib/dashData';

/* ------------------------------------------------------------------ */

export function Delta({ value, light }: { value: number; light?: boolean }) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
        light ? 'border-white/30 bg-white/15 text-white' : up ? 'border-[#fe0000]/40 bg-[#fe0000]/10 text-[#ff6b6b]' : 'border-white/15 bg-white/5 text-white/60'
      }`}
      title="Comparado ao período anterior do mesmo tamanho"
    >
      <Icon size={11} aria-hidden />
      {Math.abs(value).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%
      <span className="sr-only">{up ? 'de alta' : 'de queda'} em relação ao período anterior</span>
    </span>
  );
}

export function PeriodPills({ value, onChange }: { value: PeriodKey; onChange: (p: PeriodKey) => void }) {
  return (
    <div role="tablist" aria-label="Período" className="tabs-track inline-flex max-w-full overflow-x-auto rounded-full border border-white/10 bg-black/30 p-1">
      {PERIODS.map((p) => (
        <button
          key={p.key}
          role="tab"
          aria-selected={value === p.key}
          onClick={() => onChange(p.key)}
          className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
            value === p.key ? 'bg-[#fe0000] text-white shadow-[0_0_18px_rgba(254,0,0,0.45)]' : 'text-white/55 hover:text-white'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/** superfície escura com leve brilho vermelho — o "card" do dashboard */
export function Panel({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-[linear-gradient(160deg,#1c0b0b_0%,#120808_45%,#0e0909_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}
    >
      {children}
    </section>
  );
}

/** card vermelho vivo (carteira / chamada) */
export function RedPanel({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,#ff2a2a_0%,#d90000_45%,#a30000_100%)] shadow-[0_20px_60px_-20px_rgba(254,0,0,0.6)] ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.18), transparent)' }}
      />
      {children}
    </section>
  );
}

/** linha branca brilhante sobre área vermelha, eixo de valores à direita */
const W = 1000;
const pad = { t: 14, r: 96, b: 10, l: 6 };

export function GlowLine({ data, height = 230, money = true }: { data: Pt[]; height?: number; money?: boolean }) {
  const id = useId().replace(/:/g, '');
  const { line, area, ticks, last } = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.value)) * 1.08;
    const iw = W - pad.l - pad.r;
    const ih = height - pad.t - pad.b;
    const step = data.length > 1 ? iw / (data.length - 1) : 0;
    const pts = data.map((d, i) => [pad.l + i * step, pad.t + ih - (d.value / max) * ih] as const);
    const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const area = `${line} L${pts[pts.length - 1][0]},${pad.t + ih} L${pad.l},${pad.t + ih} Z`;
    const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => ({ y: pad.t + ih - f * ih, v: max * f }));
    return { line, area, ticks, last: pts[pts.length - 1] };
  }, [data, height]);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }} role="img" aria-label="Gráfico de evolução">
        <defs>
          <linearGradient id={`a${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fe0000" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fe0000" stopOpacity="0" />
          </linearGradient>
          <filter id={`g${id}`} x="-5%" y="-30%" width="110%" height="160%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        {ticks.map((t) => (
          <g key={t.y}>
            <line x1={pad.l} x2={W - pad.r} y1={t.y} y2={t.y} stroke="rgba(255,255,255,0.05)" />
            <text x={W - pad.r + 14} y={t.y + 4} fill="rgba(255,255,255,0.4)" fontSize="15" fontFamily="inherit">
              {compact(t.v, money)}
            </text>
          </g>
        ))}
        <path d={area} fill={`url(#a${id})`} />
        <path d={line} fill="none" stroke="#ff3b3b" strokeWidth="7" opacity="0.55" filter={`url(#g${id})`} />
        <path d={line} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {last && <circle cx={last[0]} cy={last[1]} r="6" fill="#fff" stroke="#fe0000" strokeWidth="4" />}
      </svg>
      <XLabels data={data} />
    </div>
  );
}

function XLabels({ data }: { data: Pt[] }) {
  // no celular mostra só alguns rótulos pra não embolar
  const every = data.length > 14 ? Math.ceil(data.length / 7) : 1;
  return (
    <div className="mt-3 flex justify-between pr-[9.6%] text-[10px] text-white/40">
      {data.map((d, i) => (
        <span key={i} className={i === data.length - 1 ? 'font-bold text-white' : i % every ? 'invisible' : ''}>
          {d.label}
        </span>
      ))}
    </div>
  );
}

/** barras por mês, última em destaque */
export function Bars({ data, money = true, height = 220 }: { data: Pt[]; money?: boolean; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 sm:gap-3" style={{ height }} role="img" aria-label="Gráfico de barras por mês">
      {data.map((d, i) => {
        const last = i === data.length - 1;
        const h = Math.max(6, (d.value / max) * (height - 56));
        return (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className={`text-[10px] font-bold ${last ? 'text-white' : 'text-white/50'}`}>{compact(d.value, money)}</span>
            <div
              className={`w-full rounded-t-2xl rounded-b-md ${
                last
                  ? 'bg-[linear-gradient(180deg,#ff6b6b,#e00000_60%,#9e0000)] shadow-[0_0_30px_rgba(254,0,0,0.45)]'
                  : 'bg-[linear-gradient(180deg,rgba(254,0,0,0.45),rgba(254,0,0,0.15))]'
              }`}
              style={{ height: h }}
            />
            <span className={`text-[10px] ${last ? 'font-bold text-[#ff6b6b]' : 'text-white/45'}`}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** o "cartão" dentro da carteira */
export function WalletCard({ label, value, delta, foot }: { label: string; value: string; delta?: number; foot?: string }) {
  return (
    <div className="relative">
      <div aria-hidden className="absolute inset-x-5 -top-3 h-8 rounded-t-2xl bg-black/25" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#1d1d1f,#0b0b0c_60%,#1a0e0e)] p-5 shadow-2xl shadow-black/50">
        <div aria-hidden className="absolute right-0 top-0 h-full w-1/2 bg-[linear-gradient(115deg,transparent_45%,rgba(255,255,255,0.05)_50%,transparent_55%)]" />
        <div className="flex items-start justify-between">
          <img src="/logo.png" alt="" width="500" height="500" className="h-8 w-auto opacity-90" />
          <span aria-hidden className="grid h-8 w-11 grid-cols-3 gap-px overflow-hidden rounded-md bg-[linear-gradient(135deg,#f2f2f2,#bdbdbd)] p-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="rounded-[2px] bg-black/10" />
            ))}
          </span>
        </div>
        <p className="mt-6 text-[11px] text-white/55">{label}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
          {delta !== undefined && <Delta value={delta} />}
        </div>
        {foot && <p className="mt-1 text-[10px] text-white/40">{foot}</p>}
      </div>
    </div>
  );
}

/** linha da lista "vendas recentes" dentro da carteira */
export function RecentRow({ title, sub, value }: { title: string; sub: string; value: string }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fe0000] text-[11px] font-bold text-white shadow-[0_0_14px_rgba(254,0,0,0.5)]">
        {initials(title)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">{title}</span>
        <span className="block text-[11px] text-white/55">{sub}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[11px] font-bold">
        <ArrowUpRight size={11} aria-hidden /> {value}
      </span>
    </li>
  );
}

/** bolinhas com iniciais (empresas na fila) */
export function AvatarStack({ names, extra }: { names: string[]; extra?: number }) {
  return (
    <div className="flex items-center">
      {names.slice(0, 3).map((n, i) => (
        <span
          key={n + i}
          title={n}
          className="-ml-2 grid h-10 w-10 place-items-center rounded-full border-2 border-[#c40000] bg-[#2a0a0a] text-[11px] font-bold first:ml-0"
        >
          {initials(n)}
        </span>
      ))}
      <span className="-ml-2 grid h-10 w-10 place-items-center rounded-full border-2 border-[#c40000] bg-white text-sm font-bold text-[#c40000]">
        {extra ? `+${extra > 99 ? '99' : extra}` : '+'}
      </span>
    </div>
  );
}
