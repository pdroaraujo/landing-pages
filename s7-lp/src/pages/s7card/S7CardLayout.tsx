import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Nfc, LogOut, Menu, X, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const nav = [
  { to: '/s7card', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/s7card/lojas', label: 'Lojas', icon: Store },
  { to: '/s7card/placas', label: 'Placas', icon: Nfc },
];

export default function S7CardLayout() {
  const { profile, workspaces, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const doSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const navItems = (
    <nav className="flex flex-col gap-1">
      {nav.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              isActive ? 'bg-[#fe0000] text-white' : 'text-white/55 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <n.icon size={18} />
          {n.label}
        </NavLink>
      ))}
    </nav>
  );

  const hasAgencia = workspaces?.includes('agencia');

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f4f4f5] font-sans selection:bg-[#fe0000] selection:text-white">
      <div className="pointer-events-none fixed top-[-20%] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] bg-[#fe0000] rounded-full blur-[200px] opacity-[0.15] z-0" />

      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-white/10 bg-[#0c0c0c]/80 backdrop-blur-md z-30 p-6">
        <div className="mb-10">
          <img src="/logo.png" alt="S7" className="h-14 w-auto self-start object-contain" />
          <span className="mt-2 block text-xs font-bold uppercase tracking-widest text-[#fe0000]">S7 Card</span>
        </div>
        {navItems}
        <div className="mt-auto pt-6 border-t border-white/10">
          {hasAgencia && (
            <NavLink
              to="/admin"
              className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeftRight size={14} /> Painel da Agência
            </NavLink>
          )}
          <p className="text-sm font-bold">{profile?.full_name ?? '—'}</p>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-4">S7 Card</p>
          <button
            onClick={doSignOut}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-[#fe0000] transition-colors"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>

      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0c0c0c]/90 backdrop-blur-md px-4 py-3">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="S7" className="h-10 w-auto" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#fe0000]">S7 Card</span>
        </div>
        <button onClick={() => setOpen(true)} className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center">
          <Menu size={18} />
        </button>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#0c0c0c] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <img src="/logo.png" alt="S7" className="h-12 w-auto" />
            <button onClick={() => setOpen(false)} className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center">
              <X size={18} />
            </button>
          </div>
          {navItems}
          {hasAgencia && (
            <NavLink to="/admin" className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50">
              <ArrowLeftRight size={14} /> Painel da Agência
            </NavLink>
          )}
          <button onClick={doSignOut} className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-[#fe0000]">
            <LogOut size={14} /> Sair
          </button>
        </div>
      )}

      <main className="relative z-10 lg:pl-64">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-8 pt-20 lg:pt-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
