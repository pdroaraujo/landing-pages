import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

/** Depois do login, manda cada um pro workspace certo — a agência nunca vê o S7 Card e vice-versa. */
export default function RoleRedirect() {
  const { workspaces } = useAuth();

  if (workspaces === null) return <div className="min-h-screen bg-[#0f0f0f]" />;
  if (workspaces.includes('agencia')) return <Navigate to="/admin" replace />;
  if (workspaces.includes('s7card')) return <Navigate to="/s7card" replace />;
  if (workspaces.includes('cliente')) return <Navigate to="/cliente" replace />;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center p-8 text-center">
      <p className="text-sm text-white/50">Seu usuário ainda não tem acesso a nenhuma área. Fale com o admin.</p>
    </div>
  );
}
