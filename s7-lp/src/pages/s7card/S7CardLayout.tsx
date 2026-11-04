import { useEffect } from 'react';
import { LayoutDashboard, Nfc, MapPinned, Users, Printer } from 'lucide-react';
import { prefetchWhenIdle } from '../../lib/prefetch';
import { useAuth } from '../../lib/auth';
import PanelShell, { type NavItem } from '../../components/admin/PanelShell';

const baseNav: NavItem[] = [
  { to: '/s7card', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/s7card/mapeamento', label: 'Mapeamento', icon: MapPinned },
  { to: '/s7card/placas', label: 'Placas', icon: Nfc },
  { to: '/s7card/grafica', label: 'Gráfica', icon: Printer },
];

const ROLE_LABEL: Record<string, string> = { owner: 'Administrador', member: 'Administrador', socio: 'Sócio', vendedor: 'Vendedor' };

export default function S7CardLayout() {
  const { workspaces, s7Role, s7Full } = useAuth();
  const nav = s7Full ? [...baseNav, { to: '/s7card/equipe', label: 'Equipe e clientes', icon: Users }] : baseNav;

  useEffect(() => {
    prefetchWhenIdle([
      () => import('./S7CardDashboard'),
      () => import('./S7CardMapeamento'),
      () => import('./S7CardPlacas'),
      () => import('./S7CardLojaDetalhe'),
      () => import('./S7CardGrafica'),
    ]);
  }, []);

  return (
    <PanelShell
      nav={nav}
      roleLabel={`S7 Card · ${ROLE_LABEL[s7Role ?? ''] ?? 'Equipe'}`}
      switchTo={workspaces?.includes('agencia') ? { to: '/admin', label: 'Ir pra Agência' } : undefined}
    />
  );
}
