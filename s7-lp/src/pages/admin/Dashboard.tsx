import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  RefreshCw,
  Upload,
  Users,
  FileText,
  FilePlus2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Sale } from '../../lib/types';
import { brl, num, shortDate } from '../../lib/format';
import { Card, PageHeader, Btn } from '../../components/admin/ui';
import AreaChart from '../../components/admin/AreaChart';

type Period = 'hoje' | '7d' | '30d' | 'mes' | 'ano' | 'todo';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'hoje', label: 'Hoje' },
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: 'mes', label: 'Este mês' },
  { key: 'ano', label: 'Este ano' },
  { key: 'todo', label: 'Todo período' },
];

function startOf(period: Period): Date | null {
  const now = new Date();
  switch (period) {
    case 'hoje':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case '7d':
      return new Date(now.getTime() - 7 * 864e5);
    case '30d':
      return new Date(now.getTime() - 30 * 864e5);
    case 'mes':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'ano':
      return new Date(now.getFullYear(), 0, 1);
    case 'todo':
      return null;
  }
}

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('todo');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('sales').select('*').order('sold_at', { ascending: true });
    setSales((data as Sale[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const from = startOf(period);
    return from ? sales.filter((s) => new Date(s.sold_at) >= from) : sales;
  }, [sales, period]);

  const m = useMemo(() => {
    const faturamento = filtered.reduce((a, s) => a + Number(s.value || 0), 0);
    const recorrencia = filtered
      .filter((s) => s.recurring)
      .reduce((a, s) => a + Number(s.monthly_value || 0), 0);
    const contratos = filtered.filter((s) => s.contract_signed).length;
    const totalVendas = filtered.length;
    const ticket = totalVendas ? faturamento / totalVendas : 0;

    // evolução mensal (12 meses do ano corrente)
    const year = new Date().getFullYear();
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const evo = months.map((label, i) => ({
      label,
      value: filtered
        .filter((s) => {
          const d = new Date(s.sold_at);
          return d.getFullYear() === year && d.getMonth() === i;
        })
        .reduce((a, s) => a + Number(s.value || 0), 0),
    }));

    const byProduct = new Map<string, { total: number; count: number }>();
    filtered.forEach((s) => {
      const p = byProduct.get(s.product) ?? { total: 0, count: 0 };
      p.total += Number(s.value || 0);
      p.count += 1;
      byProduct.set(s.product, p);
    });
    const top = [...byProduct.entries()]
      .map(([product, v]) => ({ product, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const latest = [...filtered].sort((a, b) => +new Date(b.sold_at) - +new Date(a.sold_at)).slice(0, 6);

    return { faturamento, recorrencia, contratos, totalVendas, ticket, evo, top, latest };
  }, [filtered]);

  const stats = [
    { label: 'Faturamento total', value: brl(m.faturamento), sub: 'valor acumulado', icon: DollarSign },
    { label: 'Recorrência mensal', value: brl(m.recorrencia), sub: `${m.contratos} contratos assinados`, icon: TrendingUp },
    { label: 'Ticket médio', value: brl(m.ticket), sub: `${m.totalVendas} vendas realizadas`, icon: ShoppingCart },
    { label: 'Total de vendas', value: num(m.totalVendas), sub: 'vendas realizadas', icon: ShoppingCart },
  ];

  const actions = [
    { to: '/admin/prospeccao', title: 'Encontrar Clientes', sub: 'Buscar novos leads', icon: Users },
    { to: '/admin/prospeccao/roleta', title: 'Roleta', sub: 'Sortear nicho e cidade', icon: RefreshCw },
    { to: '/admin/vendas', title: 'Registrar Venda', sub: 'Nova venda ou import', icon: FilePlus2 },
    { to: '/admin/listas', title: 'Listas', sub: 'Filas de ligação do dia', icon: FileText },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={
          <>
            Central de controle para acompanhar <span className="text-[#fe0000]">vendas</span>,{' '}
            <span className="text-[#fe0000]">recorrência</span> e{' '}
            <span className="text-[#fe0000]">desempenho</span>.
          </>
        }
        actions={
          <>
            <Btn variant="outline" onClick={() => (window.location.href = '/admin/vendas')}>
              <Upload size={14} /> Importar
            </Btn>
            <Btn variant="solid" onClick={load}>
              <RefreshCw size={14} /> Atualizar
            </Btn>
          </>
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

      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 font-bold tracking-tight">
                <TrendingUp size={16} className="text-[#fe0000]" /> Evolução do Faturamento
              </h3>
              <p className="text-xs text-white/40 mt-1">Período: {brl(m.faturamento)}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                    period === p.key ? 'bg-[#fe0000] text-white' : 'text-white/45 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <AreaChart data={m.evo} />
        </Card>

        <Card className="p-6">
          <h3 className="font-bold tracking-tight mb-5">Ações Rápidas</h3>
          <div className="flex flex-col gap-3">
            {actions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:border-[#fe0000]/40 transition-colors"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#fe0000]/15 text-[#fe0000]">
                  <a.icon size={16} />
                </span>
                <span>
                  <span className="block text-sm font-bold">{a.title}</span>
                  <span className="block text-xs text-white/40">{a.sub}</span>
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-bold tracking-tight mb-5">Top 5 Produtos</h3>
          {m.top.length === 0 ? (
            <Empty>Nenhuma venda registrada ainda.</Empty>
          ) : (
            <ul className="flex flex-col gap-3">
              {m.top.map((t, i) => (
                <li key={t.product} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white/30 w-4">{i + 1}</span>
                  <span className="flex-1 text-sm">{t.product}</span>
                  <span className="text-xs text-white/40">{t.count}x</span>
                  <span className="text-sm font-bold">{brl(t.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-bold tracking-tight mb-5">Últimas Vendas</h3>
          {m.latest.length === 0 ? (
            <Empty>Nenhuma venda registrada ainda.</Empty>
          ) : (
            <ul className="flex flex-col divide-y divide-white/5">
              {m.latest.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5">
                  <span>
                    <span className="block text-sm font-medium">{s.client_name}</span>
                    <span className="block text-xs text-white/40">
                      {s.product} · {shortDate(s.sold_at)}
                    </span>
                  </span>
                  <span className="text-sm font-bold">{brl(s.value)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-white/35">{children}</p>;
}
