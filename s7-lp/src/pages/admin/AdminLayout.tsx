import { useEffect } from 'react';
import { LayoutDashboard, Radar, ListChecks, DollarSign } from 'lucide-react';
import { prefetchWhenIdle } from '../../lib/prefetch';
import { useAuth } from '../../lib/auth';
import PanelShell, { type NavItem } from '../../components/admin/PanelShell';

const nav: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/prospeccao/roleta', label: 'Prospecção', icon: Radar },
  { to: '/admin/listas', label: 'Listas', icon: ListChecks },
  { to: '/admin/vendas', label: 'Vendas', icon: DollarSign },
];

export default function AdminLayout() {
  const { profile, workspaces } = useAuth();

  useEffect(() => {
    prefetchWhenIdle([
      () => import('./Dashboard'),
      () => import('./Roleta'),
      () => import('./Listas'),
      () => import('./ListaDetalhe'),
      () => import('./Vendas'),
    ]);
  }, []);

  return (
    <PanelShell
      nav={nav}
      roleLabel={`Agência · ${profile?.role === 'admin' ? 'Administrador' : 'Vendedor'}`}
      switchTo={workspaces?.includes('s7card') ? { to: '/s7card', label: 'Ir pro S7 Card' } : undefined}
    />
  );
}
