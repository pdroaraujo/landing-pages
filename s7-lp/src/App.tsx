import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';

// A landing pública ("/") não precisa de sessão nem de Supabase — fica fora do
// grupo autenticado pra não baixar esse peso pra quem só visita o site.
const TapRedirect = lazy(() => import('./pages/TapRedirect'));
const AuthedRoutes = lazy(() => import('./AuthedRoutes'));
// Loja (e-commerce, src/pages/loja) está EM REPOUSO: fora das rotas até o Felipe liberar.
// Pra reativar: const Loja = lazy(() => import('./pages/loja/Loja')); + <Route path="/loja" element={<Loja />} />

function Blank() {
  return <div className="min-h-screen bg-[#0f0f0f]" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Blank />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/r/:code" element={<TapRedirect />} />
          <Route path="/*" element={<AuthedRoutes />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
