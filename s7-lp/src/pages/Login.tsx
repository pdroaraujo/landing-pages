import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { inputClass } from '../components/admin/ui';
import RoleRedirect from '../components/RoleRedirect';

export default function Login() {
  const { session, signIn, ready } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (session) return <RoleRedirect />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (error) {
      console.error('[login]', error);
      setErr(
        /invalid login credentials/i.test(error)
          ? 'E-mail ou senha inválidos.'
          : `Erro: ${error}`,
      );
    }
    // sucesso: `session` muda via onAuthStateChange e o componente re-renderiza
    // no `if (session) return <RoleRedirect />` acima, já mandando pro workspace certo.
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans flex items-center justify-center px-6 relative overflow-hidden selection:bg-[#fe0000]">
      <div className="pointer-events-none absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-[#fe0000] rounded-full blur-[180px] opacity-25" />
      <div className="relative z-10 w-full max-w-sm">
        <Link to="/" className="block mb-10 text-center">
          <img src="/logo.png" alt="Agência S7" className="h-20 w-auto mx-auto" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tighter uppercase text-center mb-1">Painel S7</h1>
        <p className="text-white/40 text-xs uppercase tracking-widest text-center mb-8">Acesso restrito</p>

        {!ready && (
          <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
            Supabase não configurado (.env).
          </p>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            required
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          {err && <p className="text-xs text-[#ff5a5a]">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="group relative mt-2 flex items-center justify-center gap-3 overflow-hidden rounded-full bg-[#fe0000] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-50"
          >
            <span className="relative z-10">{loading ? 'Entrando...' : 'Entrar'}</span>
            <ArrowRight size={16} className="relative z-10" />
          </button>
        </form>
      </div>
    </div>
  );
}
