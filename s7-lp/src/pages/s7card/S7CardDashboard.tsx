import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPinned, Nfc, MousePointerClick } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { brl, num, shortDate } from '../../lib/format';
import { DashHeader } from '../../components/admin/PanelShell';
import {
  Panel, RedPanel, GlowLine, Bars, WalletCard, RecentRow, AvatarStack, Delta, PeriodPills,
} from '../../components/admin/dash';
import { series, monthlyBars, type PeriodKey } from '../../lib/dashData';

type StoreRow = { id: string; name: string; city: string | null; status: string; sold_value: number; sold_at: string };
type TagRow = { status: string; sold_value: number; quantity: number; installed_at: string | null; created_at: string };
type ClientRow = { paid_until: string | null; trial_ends_at: string; monthly_price: number };
type TapRow = { tapped_at: string };
/** uma venda = loja vendida ou placa com valor (o faturamento soma os dois) */
type SaleRow = { date: string; value: number };

export default function S7CardDashboard() {
  const { s7Full, profile } = useAuth();
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [tags, setTags] = useState<TagRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [taps, setTaps] = useState<TapRow[]>([]);
  const [queue, setQueue] = useState<{ names: string[]; total: number }>({ names: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodKey>('6m');
  const [barsMode, setBarsMode] = useState<'toques' | 'vendas'>('toques');

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 366 * 864e5).toISOString();
      // a RLS já filtra: vendedor só recebe as lojas/placas/toques dele
      const [{ data: s }, { data: t }, { data: c }, { data: tp }, { data: q, count }] = await Promise.all([
        supabase.from('s7card_stores').select('id, name, city, status, sold_value, sold_at').order('sold_at', { ascending: false }),
        supabase.from('s7card_tags').select('status, sold_value, quantity, installed_at, created_at'),
        s7Full ? supabase.from('s7card_clients').select('paid_until, trial_ends_at, monthly_price') : Promise.resolve({ data: [] }),
        supabase.from('s7card_taps').select('tapped_at').gte('tapped_at', since),
        supabase.from('s7card_prospects').select('name', { count: 'exact' }).eq('status', 'a_prospectar').limit(3),
      ]);
      setStores((s as StoreRow[]) ?? []);
      setTags((t as TagRow[]) ?? []);
      setClients((c as ClientRow[]) ?? []);
      setTaps((tp as TapRow[]) ?? []);
      const names = ((q as { name: string }[]) ?? []).map((r) => r.name);
      setQueue({ names, total: count ?? names.length });
      setLoading(false);
    })();
  }, [s7Full]);

  const sales: SaleRow[] = useMemo(
    () => [
      ...stores.filter((x) => Number(x.sold_value) > 0).map((x) => ({ date: x.sold_at, value: Number(x.sold_value) })),
      ...tags.filter((x) => Number(x.sold_value) > 0).map((x) => ({ date: x.installed_at ?? x.created_at, value: Number(x.sold_value) })),
    ],
    [stores, tags],
  );

  const s = useMemo(() => series(sales, (x) => x.date, (x) => x.value, period), [sales, period]);
  const bars = useMemo(
    () => (barsMode === 'toques' ? monthlyBars(taps, (x) => x.tapped_at, () => 1) : monthlyBars(sales, (x) => x.date, (x) => x.value)),
    [barsMode, taps, sales],
  );

  const today = new Date().toISOString().slice(0, 10);
  const pagantes = clients.filter((c) => c.paid_until && c.paid_until >= today);
  const mrr = pagantes.reduce((a, c) => a + Number(c.monthly_price || 0), 0);
  const emTeste = clients.filter((c) => !(c.paid_until && c.paid_until >= today) && c.trial_ends_at >= today).length;
  const totalAll = sales.reduce((a, x) => a + x.value, 0);
  const placas = (st: string) => tags.filter((x) => x.status === st).reduce((a, x) => a + (x.quantity || 1), 0);
  const toquesMes = taps.filter((x) => x.tapped_at.slice(0, 7) === today.slice(0, 7)).length;

  return (
    <div>
      <DashHeader
        title={<>Olá, {profile?.full_name?.split(' ')[0] ?? 'equipe'}</>}
        actions={
          <Link
            to="/s7card/mapeamento"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#fe0000] px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#d40000]"
          >
            <Plus size={14} aria-hidden /> Nova loja
          </Link>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_440px]">
        <Panel className="p-5 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#fe0000]" /> {s7Full ? 'Faturamento no período' : 'Minhas vendas no período'}
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
            {[
              ['Lojas ativas', num(stores.filter((x) => x.status === 'ativa').length)],
              ['Placas instaladas', num(placas('instalada'))],
              ['Em estoque', num(placas('em_estoque'))],
              ['Toques no mês', num(toquesMes)],
              ...(s7Full ? [['Clientes em teste', num(emTeste)]] : []),
            ].map(([k, v]) => (
              <span key={k} className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-white/60">
                {k} <b className="ml-1 text-white">{v}</b>
              </span>
            ))}
          </div>
        </Panel>

        <RedPanel className="p-5 md:p-6 xl:row-span-2">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{s7Full ? 'Carteira S7 Card' : 'Minha carteira'}</h2>
            <Link
              to="/s7card/placas"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-xs font-bold hover:bg-white/25"
            >
              <Plus size={14} aria-hidden /> Nova placa
            </Link>
          </div>
          <WalletCard
            label={s7Full ? 'Faturamento acumulado' : 'Meu faturamento'}
            value={loading ? '—' : brl(totalAll)}
            delta={s.delta}
            foot={s7Full ? `Recorrência ${brl(mrr)}/mês · ${pagantes.length} assinantes` : `${sales.length} vendas`}
          />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link to="/s7card/mapeamento" className="flex items-center justify-center gap-2 rounded-2xl bg-black/25 py-3.5 text-sm font-bold hover:bg-black/35">
              <MapPinned size={15} aria-hidden /> Mapeamento
            </Link>
            <Link to="/s7card/placas" className="flex items-center justify-center gap-2 rounded-2xl bg-white/90 py-3.5 text-sm font-bold text-[#c40000] hover:bg-white">
              <Nfc size={15} aria-hidden /> Placas
            </Link>
          </div>
          <div className="mb-3 mt-7 flex items-center justify-between">
            <h3 className="text-lg font-bold">Lojas recentes</h3>
            <Link to="/s7card/mapeamento" className="text-sm text-white/80 hover:text-white">
              Ver todas
            </Link>
          </div>
          {stores.length === 0 ? (
            <p className="rounded-2xl border border-white/20 bg-black/20 p-5 text-center text-xs text-white/80">Nenhuma loja vendida ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {stores.slice(0, 4).map((x) => (
                <Link key={x.id} to={`/s7card/lojas/${x.id}`} className="block">
                  <RecentRow title={x.name} sub={`${x.city ? x.city + ' · ' : ''}${shortDate(x.sold_at)}`} value={brl(x.sold_value)} />
                </Link>
              ))}
            </ul>
          )}
        </RedPanel>

        <div className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
          <RedPanel className="flex flex-col p-6">
            <h2 className="text-xl font-bold leading-tight md:text-2xl">Sua próxima placa começa agora.</h2>
            <p className="mt-2 text-sm text-white/85">
              {queue.total} {queue.total === 1 ? 'estabelecimento esperando' : 'estabelecimentos esperando'} sua visita.
            </p>
            <div className="mt-5">
              <AvatarStack names={queue.names} extra={Math.max(0, queue.total - queue.names.length)} />
            </div>
            <div className="mt-auto pt-6">
              <Link
                to="/s7card/mapeamento"
                className="flex items-center justify-center gap-2 rounded-full bg-white py-3.5 text-sm font-bold text-[#c40000] shadow-lg hover:bg-white/90"
              >
                <MapPinned size={16} aria-hidden /> Abrir mapeamento
              </Link>
            </div>
          </RedPanel>

          <Panel className="p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  {barsMode === 'toques' && <MousePointerClick size={16} className="text-[#fe0000]" aria-hidden />}
                  {barsMode === 'toques' ? 'Toques por mês' : 'Vendas por mês'}
                </h2>
                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {barsMode === 'toques' ? num(bars.reduce((a, b) => a + b.value, 0)) : brl(bars.reduce((a, b) => a + b.value, 0))}
                </p>
              </div>
              <div role="tablist" aria-label="O que mostrar" className="inline-flex rounded-full border border-white/10 bg-black/40 p-1 text-[11px]">
                {(['toques', 'vendas'] as const).map((k) => (
                  <button
                    key={k}
                    role="tab"
                    aria-selected={barsMode === k}
                    onClick={() => setBarsMode(k)}
                    className={`rounded-full px-3 py-1 capitalize ${barsMode === k ? 'bg-[#fe0000] text-white' : 'text-white/55'}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
            <Bars data={bars} money={barsMode === 'vendas'} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
