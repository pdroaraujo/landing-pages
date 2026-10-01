import type { ReactNode } from 'react';
import { AGENCY_DOMAIN, emailUser } from '../../lib/agency';

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">{title}</h1>
        {subtitle && <p className="text-white/50 mt-2 max-w-xl text-sm leading-relaxed">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  type = 'button',
  variant = 'solid',
  disabled,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'solid' | 'outline' | 'ghost';
  disabled?: boolean;
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const styles = {
    solid: 'bg-[#fe0000] text-white hover:bg-[#d40000]',
    outline: 'border border-white/20 text-white hover:bg-white/10',
    ghost: 'text-white/60 hover:text-white hover:bg-white/5',
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base sm:text-sm text-white placeholder-white/30 outline-none focus:border-[#fe0000]/60 transition-colors';

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'red' | 'green' | 'amber' | 'blue' }) {
  const tones = {
    default: 'bg-white/10 text-white/70',
    red: 'bg-[#fe0000]/15 text-[#ff5a5a]',
    green: 'bg-emerald-500/15 text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-400',
    blue: 'bg-sky-500/15 text-sky-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** todo login criado pelo painel usa o domínio da agência: a pessoa só digita o usuário */
export function AgencyEmailInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-[#fe0000]/60">
      <input
        required
        value={value}
        onChange={(e) => onChange(emailUser(e.target.value))}
        placeholder="usuario"
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base sm:text-sm text-white placeholder-white/30 outline-none"
      />
      <span className="flex items-center border-l border-white/10 px-3 text-sm text-white/40">@{AGENCY_DOMAIN}</span>
    </div>
  );
}
