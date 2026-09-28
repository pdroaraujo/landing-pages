import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Card, PageHeader, Btn, Field, inputClass } from '../components/admin/ui';

export default function ChangePassword() {
  const { profile, workspaces } = useAuth();
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const backTo = workspaces?.includes('agencia') ? '/admin' : '/s7card';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(false);
    if (pwd.length < 8) {
      setErr('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (pwd !== confirm) {
      setErr('As senhas não coincidem.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setOk(true);
    setPwd('');
    setConfirm('');
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link to={backTo} className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">
          <ArrowLeft size={14} /> Voltar
        </Link>
        <Card className="p-7">
          <PageHeader
            title="Trocar senha"
            subtitle={`Conta: ${profile?.full_name ?? '—'}`}
          />
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Nova senha">
              <input type="password" required minLength={8} value={pwd} onChange={(e) => setPwd(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Confirmar nova senha">
              <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
            </Field>
            {err && <p className="text-xs text-[#ff5a5a]">{err}</p>}
            {ok && <p className="text-xs text-emerald-400">Senha atualizada.</p>}
            <Btn type="submit" disabled={saving} className="mt-1">
              <KeyRound size={14} /> {saving ? 'Salvando...' : 'Salvar nova senha'}
            </Btn>
          </form>
        </Card>
      </div>
    </div>
  );
}
