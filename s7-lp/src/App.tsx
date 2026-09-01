import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import Landing from './pages/Landing';

const Login = lazy(() => import('./pages/Login'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Prospeccao = lazy(() => import('./pages/admin/Prospeccao'));
const Buscar = lazy(() => import('./pages/admin/Buscar'));
const Scanner = lazy(() => import('./pages/admin/Scanner'));
const Roleta = lazy(() => import('./pages/admin/Roleta'));
const Listas = lazy(() => import('./pages/admin/Listas'));
const ListaDetalhe = lazy(() => import('./pages/admin/ListaDetalhe'));
const Vendas = lazy(() => import('./pages/admin/Vendas'));

function Blank() {
  return <div className="min-h-screen bg-[#0f0f0f]" />;
}

function Protected({ children }: { children: React.ReactNode }) {
  const { session, loading, ready } = useAuth();
  if (!ready) return <ConfigMissing />;
  if (loading) return <Blank />;
  if (!session) return <Navigate to="/login" replace />;
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
            <Route
              path="/admin"
              element={
                <Protected>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
