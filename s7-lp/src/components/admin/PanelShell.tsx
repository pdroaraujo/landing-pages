import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, KeyRound, ArrowLeftRight, RefreshCw, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { initials } from '../../lib/dashData';
import { useDialog } from '../../lib/useDialog';

export type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

/**
 * Casco dos painéis (agência e S7 Card): trilho vermelho de ícones à esquerda
 * no PC, barra superior com a pessoa logada, e menu de tela cheia no celular.
 */
export default function PanelShell({
  nav,
  roleLabel,
  switchTo,
}: {
  nav: NavItem[];
  roleLabel: string;
  /** atalho pro outro painel, se a pessoa tiver acesso */
  switchTo?: { to: string; label: string };
}) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useDialog<HTMLDivElement>(open, () => setOpen(false));
  const name = profile?.full_name ?? '—';

  const doSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const railLink = (n: NavItem) => (
    <NavLink
      key={n.to}
      to={n.to}
      end={n.end}
      aria-label={n.label}
      className={({ isActive }) =>
        `group relative grid h-12 w-12 place-items-center rounded-2xl transition-colors ${
          isActive ? 'bg-white text-[#e00000] shadow-[0_8px_24px_rgba(0,0,0,0.35)]' : 'text-white/80 hover:bg-white/15 hover:text-white'
        }`
      }
    >
      <n.icon size={20} aria-hidden />
      <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-[#141414] px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {n.label}
      </span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-[#0a0707] font-sans text-[#f4f4f5] selection:bg-[#fe0000] selection:text-white">
      {/* trilho (PC) */}
      <aside className="fixed inset-y-3 left-3 z-30 hidden w-[76px] flex-col items-center rounded-[26px] bg-[linear-gradient(180deg,#ff2a2a,#d40000_55%,#a80000)] py-5 shadow-[0_20px_50px_-15px_rgba(254,0,0,0.55)] lg:flex">
        <img src="/logo-256.webp" alt="S7" width="500" height="500" className="mb-6 h-10 w-auto brightness-0 invert" />
        <nav aria-label="Menu principal" className="flex flex-col items-center gap-2">
          {nav.map(railLink)}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-2 border-t border-white/20 pt-4">
          {switchTo && railLink({ to: switchTo.to, label: switchTo.label, icon: ArrowLeftRight })}
          {railLink({ to: '/conta/senha', label: 'Trocar senha', icon: KeyRound })}
          <button
            onClick={doSignOut}
            aria-label="Sair"
            className="group relative grid h-12 w-12 place-items-center rounded-2xl text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            <LogOut size={20} aria-hidden />
            <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-[#141414] px-3 py-1.5 text-xs font-bold opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
              Sair
            </span>
          </button>
        </div>
      </aside>

      {/* barra do topo */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0a0707]/85 backdrop-blur-md lg:ml-[92px] lg:border-none lg:bg-transparent lg:backdrop-blur-none">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 md:px-8 lg:pt-5">
          <div className="flex items-center gap-3 lg:hidden">
            <img src="/logo-256.webp" alt="S7" width="500" height="500" className="h-9 w-auto" />
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/50 lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#fe0000] shadow-[0_0_8px_#fe0000]" /> {roleLabel}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              aria-label="Atualizar dados"
              className="hidden h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 hover:text-white sm:grid"
            >
              <RefreshCw size={16} aria-hidden />
            </button>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-4">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#fe0000] text-[11px] font-bold">{initials(name)}</span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-bold">{name}</span>
                <span className="block text-[11px] text-white/45">{roleLabel}</span>
              </span>
            </div>
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={open}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 lg:hidden"
            >
              <Menu size={18} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* menu celular */}
      {open && (
        <div ref={menuRef} role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 flex flex-col bg-[linear-gradient(180deg,#d40000,#7a0000)] p-6 lg:hidden">
          <div className="mb-8 flex items-center justify-between">
            <img src="/logo-256.webp" alt="S7" width="500" height="500" className="h-10 w-auto brightness-0 invert" />
            <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="grid h-11 w-11 place-items-center rounded-full border border-white/40">
              <X size={18} aria-hidden />
            </button>
          </div>
          <nav aria-label="Menu principal" className="flex flex-col gap-1">
            {[...nav, ...(switchTo ? [{ to: switchTo.to, label: switchTo.label, icon: ArrowLeftRight }] : [])].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base font-bold ${isActive ? 'bg-white text-[#d40000]' : 'text-white/90'}`
                }
              >
                <n.icon size={19} aria-hidden /> {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-1 border-t border-white/25 pt-4">
            <NavLink to="/conta/senha" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-white/85">
              <KeyRound size={17} aria-hidden /> Trocar senha
            </NavLink>
            <button onClick={doSignOut} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-white/85">
              <LogOut size={17} aria-hidden /> Sair
            </button>
          </div>
        </div>
      )}

      <main className="relative z-10 lg:pl-[92px]">
        <div className="mx-auto max-w-[1500px] px-4 pb-10 pt-4 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function DashHeader({ title, actions }: { title: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
