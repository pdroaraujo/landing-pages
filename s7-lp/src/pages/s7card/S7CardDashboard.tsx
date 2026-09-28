import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Nfc, MousePointerClick, DollarSign, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { brl, num } from '../../lib/format';
import { Card, PageHeader, Btn } from '../../components/admin/ui';
import AreaChart from '../../components/admin/AreaChart';

type Tap = { tapped_at: string; tag: { store_id: string | null; store: { name: string } | null } | null };

export default function S7CardDashboard() {
  const [storesCount, setStoresCount] = useState({ ativa: 0, total: 0 });
  const [tagsCount, setTagsCount] = useState({ instalada: 0, em_estoque: 0, total: 0 });
  const [revenue, setRevenue] = useState(0);
  const [taps, setTaps] = useState<Tap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - 60 * 864e5).toISOString();
      const [{ data: stores }, { data: tags }, { data: tapsData }] = await Promise.all([
        supabase.from('s7card_stores').select('status, sold_value'),
        supabase.from('s7card_tags').select('status'),
        supabase
          .from('s7card_taps')
          .select('tapped_at, tag:s7card_tags(store_id, store:s7card_stores(name))')
          .gte('tapped_at', since)
          .order('tapped_at', { ascending: true }),
      ]);

      const s = (stores as { status: string; sold_value: number }[]) ?? [];
      setStoresCount({ ativa: s.filter((x) => x.status === 'ativa').length, total: s.length });
      setRevenue(s.reduce((a, x) => a + Number(x.sold_value || 0), 0));

      const t = (tags as { status: string }[]) ?? [];
      setTagsCount({
        instalada: t.filter((x) => x.status === 'instalada').length,
        em_estoque: t.filter((x) => x.status === 'em_estoque').length,
        total: t.length,
      });

      setTaps((tapsData as unknown as Tap[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const m = useMemo(() => {
    const now = new Date();
    const thisMonth = taps.filter((t) => {
      const d = new Date(t.tapped_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    // últimos 14 dias, um ponto por dia
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d;
    });
    const evo = days.map((d) => ({
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: taps.filter((t) => new Date(t.tapped_at).toDateString() === d.toDateString()).length,
    }));

    const byStore = new Map<string, number>();
    thisMonth.forEach((t) => {
      const name = t.tag?.store?.name ?? 'Sem loja';
      byStore.set(name, (byStore.get(name) ?? 0) + 1);
    });
    const ranking = [...byStore.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { monthTotal: thisMonth.length, evo, ranking };
  }, [taps]);

  const stats = [
    { label: 'Lojas ativas', value: num(storesCount.ativa), sub: `${storesCount.total} cadastradas`, icon: Store },
    { label: 'Placas instaladas', value: num(tagsCount.instalada), sub: `${tagsCount.em_estoque} em estoque`, icon: Nfc },
    { label: 'Toques este mês', value: num(m.monthTotal), sub: 'nos últimos 14 dias no gráfico', icon: MousePointerClick },
    { label: 'Faturamento (placas)', value: brl(revenue), sub: 'venda única acumulada', icon: DollarSign },
  ];

  return (
    <div>
      <PageHeader
        title="S7 Card"
        subtitle="Placas NFC — lojas, placas instaladas e toques registrados."
        actions={
          <Link to="/s7card/lojas">
            <Btn>
              <Plus size={14} /> Nova loja
            </Btn>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {stats.map((s) => (
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-bold tracking-tight mb-5 flex items-center gap-2">
            <MousePointerClick size={16} className="text-[#fe0000]" /> Toques nos últimos 14 dias
          </h3>
          <AreaChart data={m.evo} />
        </Card>
        <Card className="p-6">
          <h3 className="font-bold tracking-tight mb-5">Ranking do mês</h3>
          {m.ranking.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-white/35">
              Nenhum toque registrado ainda.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {m.ranking.map(([name, count], i) => (
                <li key={name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white/30 w-4">{i + 1}</span>
                  <span className="flex-1 text-sm">{name}</span>
                  <span className="text-sm font-bold">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
