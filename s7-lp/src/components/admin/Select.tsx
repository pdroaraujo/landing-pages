import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export type SelectOption = { value: string; label: string; hint?: string };

/**
 * Seletor com o visual do painel (no lugar do <select> nativo, que abre a
 * lista cinza do sistema). Com muitas opções (ex: cidades) mostra busca.
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
  const box = useRef<HTMLDivElement>(null);
  const withSearch = searchable ?? options.length > 12;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
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
    <div ref={box} className="relative w-full">
      <button
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

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#141414]/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
          {withSearch && (
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
              <Search size={14} className="text-white/35" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder-white/30"
              />
            </div>
          )}
          <ul className="max-h-64 overflow-y-auto p-1.5">
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
        </div>
      )}
    </div>
  );
}
