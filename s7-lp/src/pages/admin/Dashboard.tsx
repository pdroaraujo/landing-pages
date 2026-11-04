import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowUpRight, Radar, ListChecks } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Sale } from '../../lib/types';
import { brl, shortDate } from '../../lib/format';
import { DashHeader } from '../../components/admin/PanelShell';
import {
  Panel, RedPanel, GlowLine, Bars, WalletCard, RecentRow, AvatarStack, Delta, PeriodPills,
} from '../../components/admin/dash';
import { series, monthlyBars, type PeriodKey } from '../../lib/dashData';

const saleDate = (s: Sale) => s.sold_at;
const saleValue = (s: Sale) => Number(s.value || 0);

export default function Dashboard() {
  const { profile } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [queue, setQueue] = useState<{ names: string[]; total: number }>({ names: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodKey>('6m');
  const [barsRange, setBarsRange] = useState(6);

  useEffect(() => {
    (async () => {
      const [{ data }, { data: q, count }] = await Promise.all([
        supabase.from('sales').select('*').order('sold_at', { ascending: false }),
        supabase
          .from('list_items')
          .select('business:businesses(name)', { count: 'exact' })
          .eq('qualified', true)
          .eq('call_status', 'pending')
          .limit(3),
      ]);
      setSales((data as Sale[]) ?? []);
      const names = ((q as unknown as { business: { name: string } | null }[]) ?? []).map((r) => r.business?.name ?? '?');
      setQueue({ names, total: count ?? names.length });
      setLoading(false);
    })();
  }, []);

  const s = useMemo(() => series(sales, saleDate, saleValue, period), [sales, period]);
  const bars = useMemo(() => monthlyBars(sales, saleDate, saleValue, barsRange), [sales, barsRange]);
  const barsTotal = bars.reduce((a, b) => a + b.value, 0);
  const inPeriod = {
    count: s.rows.length,
    ticket: s.rows.length ? s.total / s.rows.length : 0,
    mrr: s.rows.filter((x) => x.recurring).reduce((a, x) => a + Number(x.monthly_value || 0), 0),
  };
  const totalAll = sales.reduce((a, x) => a + saleValue(x), 0);

  return (
    <div>
      <DashHeader title={<>Olá, {profile?.full_name?.split(' ')[0] ?? 'equipe'}</>} />

      <div className="grid gap-5 xl:grid-cols-[1fr_440px]">
        {/* faturamento no período */}
        <Panel className="p-5 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#fe0000]" /> Faturamento no período
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="text-4xl font-bold tracking-tighter md:text-5xl">{loading ? '—' : brl(s.total)}</p>
                {!loading && <Delta value={s.delta} />}
              </div>
            </div>
            <PeriodPills value={period} onChange={setPeriod} />
          </div>
          <div className="mt-6">
            <GlowLine data={s.points} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-white/60">
              Ticket médio <b className="ml-1 text-white">{brl(inPeriod.ticket)}</b>
            </span>
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-white/60">
              Vendas <b className="ml-1 text-white">{inPeriod.count}</b>
            </span>
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-white/60">
              Recorrência <b className="ml-1 text-white">{brl(inPeriod.mrr)}/mês</b>
            </span>
          </div>
        </Panel>

        {/* carteira */}
        <RedPanel className="p-5 md:p-6 xl:row-span-2">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Minha carteira</h2>
            <Link
              to="/admin/vendas"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-xs font-bold hover:bg-white/25"
            >
              <Plus size={14} aria-hidden /> Nova venda
            </Link>
          </div>
          <WalletCard
            label="Faturamento acumulado"
            value={loading ? '—' : brl(totalAll)}
            delta={s.delta}
            foot={`${sales.length} vendas registradas`}
          />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link to="/admin/prospeccao/roleta" className="flex items-center justify-center gap-2 rounded-2xl bg-black/25 py-3.5 text-sm font-bold hover:bg-black/35">
              <Radar size={15} aria-hidden /> Prospectar
            </Link>
            <Link to="/admin/vendas" className="flex items-center justify-center gap-2 rounded-2xl bg-white/90 py-3.5 text-sm font-bold text-[#c40000] hover:bg-white">
              <ArrowUpRight size={15} aria-hidden /> Venda
            </Link>
          </div>
          <div className="mb-3 mt-7 flex items-center justify-between">
            <h3 className="text-lg font-bold">Vendas recentes</h3>
            <Link to="/admin/vendas" className="text-sm text-white/80 hover:text-white">
              Ver todas
            </Link>
          </div>
          {sales.length === 0 ? (
            <p className="rounded-2xl border border-white/20 bg-black/20 p-5 text-center text-xs text-white/80">Nenhuma venda registrada ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {sales.slice(0, 4).map((x) => (
                <RecentRow key={x.id} title={x.client_name} sub={`${x.product} · ${shortDate(x.sold_at)}`} value={brl(x.value)} />
              ))}
            </ul>
          )}
        </RedPanel>

        <div className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
          {/* chamada pra ação */}
          <RedPanel className="flex flex-col p-6">
            <h2 className="text-xl font-bold leading-tight md:text-2xl">Sua próxima venda começa agora.</h2>
            <p className="mt-2 text-sm text-white/85">
              {queue.total} {queue.total === 1 ? 'empresa aprovada esperando' : 'empresas aprovadas esperando'} sua ligação.
            </p>
            <div className="mt-5">
              <AvatarStack names={queue.names} extra={Math.max(0, queue.total - queue.names.length)} />
            </div>
            <div className="mt-auto pt-6">
              <Link
                to="/admin/listas"
                className="flex items-center justify-center gap-2 rounded-full bg-white py-3.5 text-sm font-bold text-[#c40000] shadow-lg hover:bg-white/90"
              >
                <ListChecks size={16} aria-hidden /> Abrir listas
              </Link>
            </div>
          </RedPanel>

          {/* barras por mês */}
          <Panel className="p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Faturamento por mês</h2>
                <p className="mt-1 text-2xl font-bold tracking-tight">{brl(barsTotal)}</p>
              </div>
              <select
                value={barsRange}
                onChange={(e) => setBarsRange(Number(e.target.value))}
                aria-label="Quantidade de meses"
                className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white"
              >
                <option value={3}>3 meses</option>
                <option value={6}>6 meses</option>
                <option value={12}>12 meses</option>
              </select>
            </div>
            <Bars data={bars} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
