import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, type Workspace } from './lib/auth';
import Landing from './pages/Landing';

const TapRedirect = lazy(() => import('./pages/TapRedirect'));
const Login = lazy(() => import('./pages/Login'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Prospeccao = lazy(() => import('./pages/admin/Prospeccao'));
const Buscar = lazy(() => import('./pages/admin/Buscar'));
const Scanner = lazy(() => import('./pages/admin/Scanner'));
const Roleta = lazy(() => import('./pages/admin/Roleta'));
const Listas = lazy(() => import('./pages/admin/Listas'));
const ListaDetalhe = lazy(() => import('./pages/admin/ListaDetalhe'));
const Vendas = lazy(() => import('./pages/admin/Vendas'));

const S7CardLayout = lazy(() => import('./pages/s7card/S7CardLayout'));
const S7CardDashboard = lazy(() => import('./pages/s7card/S7CardDashboard'));
const S7CardLojas = lazy(() => import('./pages/s7card/S7CardLojas'));
const S7CardLojaDetalhe = lazy(() => import('./pages/s7card/S7CardLojaDetalhe'));
const S7CardPlacas = lazy(() => import('./pages/s7card/S7CardPlacas'));

function Blank() {
  return <div className="min-h-screen bg-[#0f0f0f]" />;
}

/** `workspace` restringe a rota a quem tem acesso àquele workspace específico —
 * a agência e o S7 Card são seções isoladas: quem só tem um nunca vê o outro. */
function Protected({ children, workspace }: { children: React.ReactNode; workspace?: Workspace }) {
  const { session, workspaces, loading, ready } = useAuth();
  if (!ready) return <ConfigMissing />;
  if (loading) return <Blank />;
  if (!session) return <Navigate to="/login" replace />;
  if (workspace) {
    if (workspaces === null) return <Blank />;
    if (!workspaces.includes(workspace)) return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function ConfigMissing() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold mb-3">Área adm não configurada</h1>
        <p className="text-white/60 text-sm">
          Defina <code className="text-[#fe0000]">VITE_SUPABASE_URL</code> e{' '}
          <code className="text-[#fe0000]">VITE_SUPABASE_ANON_KEY</code> no <code>.env</code> e refaça o build.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Blank />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/r/:code" element={<TapRedirect />} />
            <Route
              path="/conta/senha"
              element={
                <Protected>
                  <ChangePassword />
                </Protected>
              }
            />

            <Route
              path="/admin"
              element={
                <Protected workspace="agencia">
                  <AdminLayout />
                </Protected>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="prospeccao" element={<Prospeccao />} />
              <Route path="prospeccao/buscar" element={<Buscar />} />
              <Route path="prospeccao/scanner" element={<Scanner />} />
              <Route path="prospeccao/roleta" element={<Roleta />} />
              <Route path="listas" element={<Listas />} />
              <Route path="listas/:id" element={<ListaDetalhe />} />
              <Route path="vendas" element={<Vendas />} />
            </Route>

            <Route
              path="/s7card"
              element={
                <Protected workspace="s7card">
                  <S7CardLayout />
                </Protected>
              }
            >
              <Route index element={<S7CardDashboard />} />
              <Route path="lojas" element={<S7CardLojas />} />
              <Route path="lojas/:id" element={<S7CardLojaDetalhe />} />
              <Route path="placas" element={<S7CardPlacas />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
