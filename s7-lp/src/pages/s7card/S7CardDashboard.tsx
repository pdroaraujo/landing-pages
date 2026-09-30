import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, ShoppingCart, Nfc, MousePointerClick, Plus, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { brl, num } from '../../lib/format';
import { Card, PageHeader, Btn } from '../../components/admin/ui';
import AreaChart from '../../components/admin/AreaChart';

type Tap = { tapped_at: string; tag: { store_id: string | null; store: { name: string } | null } | null };
type StoreRow = { status: string; sold_value: number };
type TagRow = { status: string; sold_value: number; quantity: number };
type ClientRow = { paid_until: string | null; trial_ends_at: string; monthly_price: number };

export default function S7CardDashboard() {
  const { s7Full } = useAuth();
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [tags, setTags] = useState<TagRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [taps, setTaps] = useState<Tap[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - 60 * 864e5).toISOString();
    // a RLS já filtra: vendedor só recebe as lojas/placas/toques dele
    const [{ data: s }, { data: t }, { data: c }, { data: tp }] = await Promise.all([
      supabase.from('s7card_stores').select('status, sold_value'),
      supabase.from('s7card_tags').select('status, sold_value, quantity'),
      s7Full ? supabase.from('s7card_clients').select('paid_until, trial_ends_at, monthly_price') : Promise.resolve({ data: [] }),
      supabase
        .from('s7card_taps')
        .select('tapped_at, tag:s7card_tags(store_id, store:s7card_stores(name))')
        .gte('tapped_at', since)
        .order('tapped_at', { ascending: true }),
    ]);
    setStores((s as StoreRow[]) ?? []);
    setTags((t as TagRow[]) ?? []);
    setClients((c as ClientRow[]) ?? []);
    setTaps((tp as unknown as Tap[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s7Full]);

  const m = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const saleValues = [...stores.map((x) => Number(x.sold_value || 0)), ...tags.map((x) => Number(x.sold_value || 0))].filter((v) => v > 0);
    const faturamento = saleValues.reduce((a, v) => a + v, 0);
    const vendas = saleValues.length;
    const pagantes = clients.filter((c) => c.paid_until && c.paid_until >= today);
    const emTeste = clients.filter((c) => !(c.paid_until && c.paid_until >= today) && c.trial_ends_at >= today).length;
    const recorrencia = pagantes.reduce((a, c) => a + Number(c.monthly_price || 0), 0);

    const placas = (status: string) => tags.filter((x) => x.status === status).reduce((a, x) => a + (x.quantity || 1), 0);

    const now = new Date();
    const thisMonth = taps.filter((x) => {
      const d = new Date(x.tapped_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d;
    });
    const evo = days.map((d) => ({
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: taps.filter((x) => new Date(x.tapped_at).toDateString() === d.toDateString()).length,
    }));
    const byStore = new Map<string, number>();
    thisMonth.forEach((x) => {
      const name = x.tag?.store?.name ?? 'Placa sem loja';
      byStore.set(name, (byStore.get(name) ?? 0) + 1);
    });
    const ranking = [...byStore.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

    return {
      faturamento,
      vendas,
      ticket: vendas ? faturamento / vendas : 0,
      recorrencia,
      pagantes: pagantes.length,
      emTeste,
      lojasAtivas: stores.filter((x) => x.status === 'ativa').length,
      lojasTotal: stores.length,
      instaladas: placas('instalada'),
      estoque: placas('em_estoque'),
      toquesMes: thisMonth.length,
      evo,
      ranking,
    };
  }, [stores, tags, clients, taps]);

  const kpis = s7Full
    ? [
        { label: 'Faturamento total', value: brl(m.faturamento), sub: 'valor acumulado', icon: DollarSign },
        { label: 'Recorrência mensal', value: brl(m.recorrencia), sub: `${m.pagantes} contratos assinados`, icon: TrendingUp },
        { label: 'Ticket médio', value: brl(m.ticket), sub: `${m.vendas} vendas realizadas`, icon: ShoppingCart },
        { label: 'Total de vendas', value: num(m.vendas), sub: 'vendas realizadas', icon: ShoppingCart },
      ]
    : [
        { label: 'Meu faturamento', value: brl(m.faturamento), sub: 'só as suas vendas', icon: DollarSign },
        { label: 'Ticket médio', value: brl(m.ticket), sub: `${m.vendas} vendas realizadas`, icon: ShoppingCart },
        { label: 'Minhas vendas', value: num(m.vendas), sub: 'vendas realizadas', icon: ShoppingCart },
        { label: 'Placas instaladas', value: num(m.instaladas), sub: 'nas suas lojas', icon: Nfc },
      ];

  const operacao = [
    { label: 'Lojas ativas', value: num(m.lojasAtivas), sub: `de ${m.lojasTotal} cadastradas` },
    { label: 'Placas instaladas', value: num(m.instaladas), sub: 'em lojas' },
    { label: 'Em estoque', value: num(m.estoque), sub: 'prontas pra vender' },
    { label: 'Toques no mês', value: num(m.toquesMes), sub: 'todas as placas' },
    ...(s7Full ? [{ label: 'Clientes em teste', value: num(m.emTeste), sub: '30 dias grátis' }] : []),
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={s7Full ? 'S7 Card — vendas, recorrência e desempenho das placas.' : 'Suas vendas de placas e o desempenho das suas lojas.'}
        actions={
          <>
            <Btn variant="outline" onClick={load}>
              <RefreshCw size={14} /> Atualizar
            </Btn>
            <Link to="/s7card/mapeamento">
              <Btn>
                <Plus size={14} /> Nova loja
              </Btn>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-10">
        {kpis.map((s) => (
          <Card key={s.label} className="p-6">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/45">{s.label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#fe0000]/15 text-[#fe0000]">
                <s.icon size={16} />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tighter">{loading ? '—' : s.value}</p>
            <p className="mt-1 text-xs text-white/40">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* operação: uma faixa corrida, sem blocos */}
      <section className="mb-10">
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-white/40">Operação</h2>
        <div className="flex flex-wrap border-y border-white/10">
          {operacao.map((o, i) => (
            <div key={o.label} className={`min-w-[150px] flex-1 px-5 py-5 ${i > 0 ? 'border-l border-white/10' : ''}`}>
              <p className="text-2xl font-bold tracking-tighter">{loading ? '—' : o.value}</p>
              <p className="mt-1 text-xs font-bold text-white/70">{o.label}</p>
              <p className="text-[11px] text-white/35">{o.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/40">
            <MousePointerClick size={13} className="text-[#fe0000]" /> Toques nos últimos 14 dias
          </h2>
          <AreaChart data={m.evo} />
        </div>
        <div>
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-white/40">Lojas com mais toques no mês</h2>
          {m.ranking.length === 0 ? (
            <p className="border-t border-white/10 py-6 text-xs text-white/35">Nenhum toque registrado ainda.</p>
          ) : (
            <ol className="divide-y divide-white/10 border-y border-white/10">
              {m.ranking.map(([name, count], i) => (
                <li key={name} className="flex items-center gap-3 py-3">
                  <span className="w-5 text-xs font-bold text-white/30">{i + 1}</span>
                  <span className="flex-1 truncate text-sm">{name}</span>
                  <span className="text-sm font-bold">{count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
