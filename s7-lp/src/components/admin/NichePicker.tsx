import { useState } from 'react';
import {
  UtensilsCrossed, Sparkles, HeartPulse, Dumbbell, ShoppingBag, Wrench, GraduationCap,
  BedDouble, PartyPopper, Home, Scale, Cpu, MoreHorizontal, X, ChevronRight, Plus,
  type LucideIcon,
} from 'lucide-react';
import { NICHES, type Niche } from '../../lib/niches';

const ICONS: Record<string, LucideIcon> = {
  alimentacao: UtensilsCrossed,
  'beleza-estetica': Sparkles,
  saude: HeartPulse,
  'fitness-esportes': Dumbbell,
  comercio: ShoppingBag,
  servicos: Wrench,
  educacao: GraduationCap,
  'hospedagem-turismo': BedDouble,
  'eventos-festas': PartyPopper,
  imobiliario: Home,
  'juridico-contabil': Scale,
  tecnologia: Cpu,
  outros: MoreHorizontal,
};

const chip = (active: boolean) =>
  `rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
    active
      ? 'border-[#fe0000] bg-[#fe0000]/15 text-white'
      : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/25 hover:text-white'
  }`;

/** Chips de tipo de uma categoria + "Outro tipo" livre. `type` vazio = qualquer tipo da categoria. */
export function TypeChips({
  niche,
  type,
  onChange,
  disabled,
}: {
  niche: Niche;
  type: string;
  onChange: (t: string) => void;
  disabled?: boolean;
}) {
  const [custom, setCustom] = useState(false);
  const [draft, setDraft] = useState('');
  const isCustomValue = !!type && !niche.types.includes(type);

  const confirm = () => {
    const v = draft.trim();
    if (v) onChange(v);
    setCustom(false);
    setDraft('');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {niche.types.length > 0 && (
        <button type="button" disabled={disabled} onClick={() => onChange('')} className={chip(!type)}>
          Qualquer tipo
        </button>
      )}
      {niche.types.map((t) => (
        <button key={t} type="button" disabled={disabled} onClick={() => onChange(t === type ? '' : t)} className={chip(t === type)}>
          {t}
        </button>
      ))}
      {isCustomValue && !custom && (
        <button type="button" disabled={disabled} onClick={() => onChange('')} className={chip(true)}>
          {type}
        </button>
      )}
      {custom ? (
        <span className="flex items-center gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                confirm();
              }
            }}
            placeholder="Ex: Studio de Tatuagem"
            className="rounded-full border border-white/20 bg-white/[0.04] px-3.5 py-2 text-xs text-white outline-none focus:border-[#fe0000]"
          />
          <button type="button" onClick={confirm} className="rounded-full bg-[#fe0000] px-3.5 py-2 text-xs font-bold text-white">
            OK
          </button>
        </span>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setCustom(true)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-white/20 px-3.5 py-2 text-xs text-white/50 hover:text-white"
        >
          <Plus size={12} /> Outro tipo
        </button>
      )}
    </div>
  );
}

/** Grade de categorias -> ao escolher uma, abre os tipos dela. */
export default function NichePicker({
  nicheSlug,
  type,
  onChange,
  disabled,
}: {
  nicheSlug: string | null;
  type: string;
  onChange: (slug: string | null, type: string) => void;
  disabled?: boolean;
}) {
  const niche = NICHES.find((n) => n.slug === nicheSlug) ?? null;

  if (!niche) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {NICHES.map((n) => {
          const Icon = ICONS[n.slug] ?? MoreHorizontal;
          return (
            <button
              key={n.slug}
              type="button"
              disabled={disabled}
              onClick={() => onChange(n.slug, '')}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-[#fe0000]/50 hover:bg-white/[0.06]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fe0000]/15 text-[#fe0000]">
                <Icon size={16} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">{n.label}</span>
                <span className="block text-[11px] text-white/40">{n.types.length ? `${n.types.length} tipos` : 'Digite o seu'}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  const Icon = ICONS[niche.slug] ?? MoreHorizontal;
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#fe0000] px-4 py-2 text-sm font-bold text-white">
          <Icon size={15} /> {niche.label}
          <button type="button" disabled={disabled} onClick={() => onChange(null, '')} aria-label="Trocar categoria">
            <X size={14} />
          </button>
        </span>
        <ChevronRight size={14} className="text-white/30" />
        <span className="text-sm text-white/50">{type ? type : 'Qual tipo?'}</span>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <TypeChips niche={niche} type={type} onChange={(t) => onChange(niche.slug, t)} disabled={disabled} />
      </div>
    </div>
  );
}
