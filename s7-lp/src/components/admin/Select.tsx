import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';

export type SelectOption = { value: string; label: string; hint?: string };

type Pos = { left: number; width: number; top?: number; bottom?: number };

const LIST_MAX = 300; // altura máx. da lista aberta (px)

/**
 * Seletor com o visual do painel (no lugar do <select> nativo, que abre a
 * lista cinza do sistema). Com muitas opções (ex: cidades) mostra busca.
 * A lista abre num portal no <body>: assim nunca fica escondida atrás de
 * outro card (cada card com blur cria uma camada própria).
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  disabled,
  searchable,
  size = 'md',
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  size?: 'sm' | 'md';
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [pos, setPos] = useState<Pos | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const withSearch = searchable ?? options.length > 12;

  const place = () => {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.max(r.width, 220);
    const left = Math.min(r.left, window.innerWidth - width - 8);
    // sem espaço embaixo? abre pra cima
    if (window.innerHeight - r.bottom < LIST_MAX + 16 && r.top > window.innerHeight - r.bottom) {
      setPos({ left, width, bottom: window.innerHeight - r.top + 8 });
    } else {
      setPos({ left, width, top: r.bottom + 8 });
    }
  };

  useLayoutEffect(() => {
    if (open) place();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btn.current?.contains(t) || list.current?.contains(t)) return;
      setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return options;
    const n = norm(q);
    return options.filter((o) => norm(o.label).includes(n));
  }, [options, q]);

  const current = options.find((o) => o.value === value);
  const pad = size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm';

  return (
    <div className="relative w-full">
      <button
        ref={btn}
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen((o) => !o);
          setQ('');
        }}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white/[0.03] text-left transition-colors disabled:opacity-40 ${pad} ${
          open ? 'border-[#fe0000]/60' : 'border-white/10 hover:border-white/25'
        }`}
      >
        <span className={`truncate ${current ? 'text-white' : 'text-white/35'}`}>{current?.label ?? placeholder}</span>
        <ChevronDown size={15} className={`shrink-0 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={list}
            style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
            className="z-[1000] overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl shadow-black/70"
          >
            {withSearch && (
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
                <Search size={14} className="text-white/35" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full bg-transparent text-base sm:text-sm text-white outline-none placeholder-white/30"
                />
              </div>
            )}
            <ul className="overflow-y-auto p-1.5" style={{ maxHeight: LIST_MAX - (withSearch ? 48 : 0) }}>
              {filtered.length === 0 && <li className="px-3 py-3 text-xs text-white/35">Nada encontrado.</li>}
              {filtered.map((o) => {
                const active = o.value === value;
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        active ? 'bg-[#fe0000] text-white' : 'text-white/75 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <span className="truncate">
                        {o.label}
                        {o.hint && <span className={`ml-2 text-xs ${active ? 'text-white/70' : 'text-white/35'}`}>{o.hint}</span>}
                      </span>
                      {active && <Check size={14} className="shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
