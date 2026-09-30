import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, ShieldCheck, BadgeDollarSign, Store } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { clientAccess, type S7CardClient } from '../../lib/s7card';
import { fullDate } from '../../lib/format';
import { Card, PageHeader, Btn, Field, inputClass, Badge, AgencyEmailInput } from '../../components/admin/ui';
import { AGENCY_DOMAIN } from '../../lib/agency';

type Member = { user_id: string; role: string; profile: { full_name: string } | null };
type ClientRow = S7CardClient & { profile: { full_name: string } | null; store: { id: string; name: string } | null };

const ROLE_LABEL: Record<string, string> = { owner: 'Administrador', member: 'Administrador', socio: 'Sócio', vendedor: 'Vendedor' };

export default function S7CardEquipe() {
  const [members, setMembers] = useState<Member[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = async () => {
    const [{ data: m }, { data: c }] = await Promise.all([
      supabase.from('workspace_access').select('user_id, role, profile:profiles(full_name)').eq('workspace', 's7card'),
      supabase.from('s7card_clients').select('*, profile:profiles(full_name), store:s7card_stores(id, name)').order('created_at', { ascending: false }),
    ]);
    setMembers((m as unknown as Member[]) ?? []);
    setClients((c as unknown as ClientRow[]) ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const createSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const email = `${form.email}@${AGENCY_DOMAIN}`;
    const { data, error } = await supabase.functions.invoke('s7card-users', { body: { action: 'vendedor', ...form, email } });
    setSaving(false);
    const errText = (data as { error?: string } | null)?.error ?? (error ? 'Falha ao criar o acesso.' : null);
    if (errText) {
      setMsg({ ok: false, text: errText });
      return;
    }
    setMsg({ ok: true, text: `Acesso criado. Login: ${email} · senha: ${form.password}` });
    setForm({ full_name: '', email: '', password: '' });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Equipe e clientes"
        subtitle="Quem acessa o S7 Card. Vendedores só enxergam as próprias vendas e o próprio faturamento; clientes veem só as métricas da loja deles."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/40">
              <ShieldCheck size={13} /> Equipe
            </h2>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {members.map((m) => (
                <li key={m.user_id} className="flex items-center justify-between py-3">
                  <span className="text-sm font-bold">{m.profile?.full_name ?? '—'}</span>
                  <Badge tone={m.role === 'vendedor' ? 'default' : 'red'}>{ROLE_LABEL[m.role] ?? m.role}</Badge>
                </li>
              ))}
              {!members.length && <li className="py-4 text-xs text-white/35">Carregando…</li>}
            </ul>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/40">
              <BadgeDollarSign size={13} /> Clientes com painel de métricas
            </h2>
            {clients.length === 0 ? (
              <p className="border-y border-white/10 py-5 text-xs text-white/35">
                Nenhum cliente com acesso ainda. Crie o login do cliente na página da loja dele (Mapeamento → Vendido → Ver loja).
              </p>
            ) : (
              <ul className="divide-y divide-white/10 border-y border-white/10">
                {clients.map((c) => {
                  const a = clientAccess(c);
                  return (
                    <li key={c.user_id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <p className="text-sm font-bold">{c.profile?.full_name ?? '—'}</p>
                        {c.store && (
                          <Link to={`/s7card/lojas/${c.store.id}`} className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white">
                            <Store size={11} /> {c.store.name}
                          </Link>
                        )}
                      </div>
                      <Badge tone={a.kind === 'pago' ? 'green' : a.kind === 'teste' ? 'amber' : 'red'}>
                        {a.kind === 'pago' ? `Pago até ${fullDate(a.until)}` : a.kind === 'teste' ? `Grátis até ${fullDate(a.until)}` : 'Vencido'}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <Card className="p-6 self-start">
          <h3 className="mb-1 flex items-center gap-2 font-bold tracking-tight">
            <UserPlus size={16} className="text-[#fe0000]" /> Novo vendedor
          </h3>
          <p className="mb-5 text-xs text-white/40">
            Cadastra lojas e placas que vendeu e vê só o próprio faturamento. Não vê faturamento geral, recorrência nem a equipe.
          </p>
          <form onSubmit={createSeller} className="flex flex-col gap-4">
            <Field label="Nome">
              <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="E-mail (login)">
              <AgencyEmailInput value={form.email} onChange={(email) => setForm({ ...form, email })} />
            </Field>
            <Field label="Senha inicial">
              <input
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClass}
                placeholder="Mín. 6 caracteres — ele troca depois"
              />
            </Field>
            {msg && <p className={`text-xs ${msg.ok ? 'text-emerald-400' : 'text-[#ff5a5a]'}`}>{msg.text}</p>}
            <Btn type="submit" disabled={saving}>
              {saving ? 'Criando...' : 'Criar acesso'}
            </Btn>
          </form>
        </Card>
      </div>
    </div>
  );
}
