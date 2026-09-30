import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MousePointerClick, Star, Nfc, CalendarClock, LogOut, KeyRound, Lock, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { clientAccess, linkTypeInfo, type S7CardClient, type S7CardStore, type S7CardTag } from '../../lib/s7card';
import { brl, fullDate, num } from '../../lib/format';
import { Card, Badge } from '../../components/admin/ui';
import AreaChart from '../../components/admin/AreaChart';

const PRICE = 10;
// link de pagamento da mensalidade (ex: link da Yampi/Pix) — se não tiver, cai no WhatsApp da S7
const PAY_URL =
  (import.meta.env.VITE_S7CARD_ASSINATURA_URL as string | undefined) ||
  'https://wa.me/5513936283974?text=' + encodeURIComponent('Olá! Quero assinar o painel de métricas da minha placa S7 Card (R$ 10/mês).');

type Tap = { tapped_at: string; tag_id: string };

/** dias (inclusive) até a data yyyy-mm-dd */
const daysUntil = (iso: string) => Math.max(0, Math.ceil((+new Date(iso + 'T23:59:59') - +new Date()) / 864e5));

/** Painel do cliente (dono da loja): só as métricas das placas dele. Fora do painel adm, mesmo visual. */
export default function ClientePainel() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [client, setClient] = useState<S7CardClient | null>(null);
  const [store, setStore] = useState<S7CardStore | null>(null);
  const [tags, setTags] = useState<S7CardTag[]>([]);
  const [taps, setTaps] = useState<Tap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.from('s7card_clients').select('*').maybeSingle();
      const cl = (c as S7CardClient) ?? null;
      setClient(cl);
      if (cl) {
        const [{ data: s }, { data: t }] = await Promise.all([
          supabase.from('s7card_stores').select('*').eq('id', cl.store_id).maybeSingle(),
          supabase.from('s7card_tags').select('*').eq('store_id', cl.store_id),
        ]);
        setStore((s as S7CardStore) ?? null);
        const tagList = (t as S7CardTag[]) ?? [];
        setTags(tagList);
        if (tagList.length) {
          const { data: tp } = await supabase
            .from('s7card_taps')
            .select('tapped_at, tag_id')
            .in('tag_id', tagList.map((x) => x.id))
            .order('tapped_at', { ascending: true });
          setTaps((tp as Tap[]) ?? []);
        }
      }
      setLoading(false);
    })();
  }, []);

  const m = useMemo(() => {
    const now = new Date();
    const thisMonth = taps.filter((x) => {
      const d = new Date(x.tapped_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d;
    });
    const evo = days.map((d) => ({
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: taps.filter((x) => new Date(x.tapped_at).toDateString() === d.toDateString()).length,
    }));
    const perTag: Record<string, number> = {};
    taps.forEach((x) => {
      perTag[x.tag_id] = (perTag[x.tag_id] ?? 0) + 1;
    });
    return { total: taps.length, thisMonth, evo, perTag };
  }, [taps]);

  const doSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const access = client ? clientAccess(client) : null;
  const daysLeft = access ? daysUntil(access.until) : 0;
  const delta =
    store && store.reviews_baseline !== null && store.reviews_current !== null ? store.reviews_current - store.reviews_baseline : null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f4f4f5] font-sans selection:bg-[#fe0000] selection:text-white">
      <div className="pointer-events-none fixed top-[-20%] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] bg-[#fe0000] rounded-full blur-[200px] opacity-[0.15] z-0" />

      <header className="relative z-10 border-b border-white/10 bg-[#0c0c0c]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="S7" width="500" height="500" className="h-10 w-auto" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#fe0000]">S7 Card · Minhas métricas</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden text-sm font-bold sm:inline">{profile?.full_name}</span>
            <NavLink to="/conta/senha" className="text-white/50 hover:text-white" title="Trocar senha">
              <KeyRound size={16} />
            </NavLink>
            <button onClick={doSignOut} className="text-white/50 hover:text-[#fe0000]" title="Sair">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1200px] px-5 py-10 md:px-10">
        {loading ? (
          <p className="text-sm text-white/40">Carregando…</p>
        ) : !client || !access ? (
          <Card className="p-10 text-center text-sm text-white/50">Seu acesso ainda não foi vinculado a uma loja. Fale com a S7.</Card>
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tighter md:text-4xl">{store?.name ?? 'Minha loja'}</h1>
                <p className="mt-2 text-sm text-white/50">Quantas pessoas encostaram o celular nas suas placas S7 Card.</p>
              </div>
              <div className="flex items-center gap-3">
                <CalendarClock size={16} className="text-white/40" />
                {access.kind === 'teste' && (
                  <Badge tone="amber">
                    Teste grátis · {daysLeft} dia{daysLeft === 1 ? '' : 's'} restante{daysLeft === 1 ? '' : 's'}
                  </Badge>
                )}
                {access.kind === 'pago' && <Badge tone="green">Assinatura ativa até {fullDate(access.until)}</Badge>}
                {access.kind === 'vencido' && <Badge tone="red">Acesso vencido</Badge>}
              </div>
            </div>

            {!access.active ? (
              <Card className="mx-auto max-w-lg p-10 text-center">
                <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#fe0000]/15 text-[#fe0000]">
                  <Lock size={22} />
                </span>
                <h2 className="text-2xl font-bold tracking-tight">Seus 30 dias grátis terminaram</h2>
                <p className="mt-3 text-sm text-white/55">
                  Suas placas continuam funcionando normalmente. Pra continuar vendo quantos clientes tocam nelas, as avaliações
                  que chegaram e a evolução mês a mês, assine o painel.
                </p>
                <p className="mt-6 text-4xl font-bold tracking-tighter">
                  {brl(client.monthly_price || PRICE)}
                  <span className="text-base font-medium text-white/40">/mês</span>
                </p>
                <a
                  href={PAY_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#fe0000] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#d40000]"
                >
                  <MessageCircle size={15} /> Assinar agora
                </a>
                <p className="mt-4 text-[11px] text-white/30">Assim que o pagamento for confirmado, o painel libera de novo.</p>
              </Card>
            ) : (
              <>
                <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: 'Toques este mês', value: num(m.thisMonth), sub: 'pessoas que encostaram o celular', icon: MousePointerClick },
                    { label: 'Toques no total', value: num(m.total), sub: 'desde a instalação', icon: MousePointerClick },
                    {
                      label: 'Avaliações no Google',
                      value: store?.reviews_current ?? store?.reviews_baseline ?? '—',
                      sub:
                        delta !== null
                          ? `${delta >= 0 ? '+' : ''}${delta} desde a instalação (${store?.reviews_baseline})`
                          : 'atualizado pela S7',
                      icon: Star,
                    },
                    { label: 'Placas ativas', value: num(tags.reduce((a, t) => a + (t.quantity || 1), 0)), sub: 'na sua loja', icon: Nfc },
                  ].map((s) => (
                    <Card key={s.label} className="p-6">
                      <div className="flex items-start justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-white/45">{s.label}</span>
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#fe0000]/15 text-[#fe0000]">
                          <s.icon size={16} />
                        </span>
                      </div>
                      <p className="mt-4 text-3xl font-bold tracking-tighter">{s.value}</p>
                      <p className="mt-1 text-xs text-white/40">{s.sub}</p>
                    </Card>
                  ))}
                </div>

                <section className="grid gap-10 lg:grid-cols-[1fr_340px]">
                  <div>
                    <h2 className="mb-5 text-[11px] font-bold uppercase tracking-widest text-white/40">Toques nos últimos 30 dias</h2>
                    <AreaChart data={m.evo} />
                  </div>
                  <div>
                    <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-white/40">Por placa</h2>
                    <ul className="divide-y divide-white/10 border-y border-white/10">
                      {tags.map((t) => (
                        <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">{t.label || linkTypeInfo(t.link_type).label}</p>
                            <p className="text-[11px] text-white/35">
                              {linkTypeInfo(t.link_type).label}
                              {t.quantity > 1 ? ` · ${t.quantity} placas` : ''}
                            </p>
                          </div>
                          <span className="text-sm font-bold">{m.perTag[t.id] ?? 0}</span>
                        </li>
                      ))}
                      {!tags.length && <li className="py-4 text-xs text-white/35">Nenhuma placa instalada ainda.</li>}
                    </ul>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
