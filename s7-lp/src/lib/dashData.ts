// Cálculos dos dashboards (séries por período, barras por mês, formatação curta).
export type Pt = { label: string; value: number };

export const PERIODS = [
  { key: 'hoje', label: 'Hoje', days: 1 },
  { key: '7d', label: '7 dias', days: 7 },
  { key: '1m', label: '1 mês', days: 30 },
  { key: '3m', label: '3 meses', days: 91 },
  { key: '6m', label: '6 meses', days: 182 },
  { key: '1a', label: '1 ano', days: 365 },
] as const;
export type PeriodKey = (typeof PERIODS)[number]['key'];

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Soma valores por dia (períodos curtos) ou por mês (3 meses pra cima).
 * Também devolve o total do período anterior do mesmo tamanho, pro % de variação.
 */
export function series<T>(rows: T[], dateOf: (r: T) => string | null, valueOf: (r: T) => number, period: PeriodKey) {
  const days = PERIODS.find((p) => p.key === period)!.days;
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - days);

  let total = 0;
  let prev = 0;
  const rowsIn: T[] = [];
  const byKey = new Map<string, number>();
  const monthly = days > 31;

  rows.forEach((r) => {
    const raw = dateOf(r);
    if (!raw) return;
    const d = new Date(raw.length === 10 ? raw + 'T12:00:00' : raw);
    const v = valueOf(r);
    if (d >= start && d <= now) {
      total += v;
      rowsIn.push(r);
      const k = monthly ? `${d.getFullYear()}-${d.getMonth()}` : dayKey(d);
      byKey.set(k, (byKey.get(k) ?? 0) + v);
    } else if (d >= prevStart && d < start) prev += v;
  });

  const points: Pt[] = [];
  if (monthly) {
    const n = Math.round(days / 30.4);
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      points.push({ label: MONTHS[d.getMonth()], value: byKey.get(`${d.getFullYear()}-${d.getMonth()}`) ?? 0 });
    }
  } else {
    for (let i = Math.max(days, 2) - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      points.push({ label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), value: byKey.get(dayKey(d)) ?? 0 });
    }
  }
  const delta = prev > 0 ? ((total - prev) / prev) * 100 : total > 0 ? 100 : 0;
  return { points, total, prev, delta, rows: rowsIn };
}

/** últimos N meses, um valor por mês (pro gráfico de barras) */
export function monthlyBars<T>(rows: T[], dateOf: (r: T) => string | null, valueOf: (r: T) => number, months = 6): Pt[] {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const value = rows.reduce((a, r) => {
      const raw = dateOf(r);
      if (!raw) return a;
      const x = new Date(raw.length === 10 ? raw + 'T12:00:00' : raw);
      return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth() ? a + valueOf(r) : a;
    }, 0);
    return { label: MONTHS[d.getMonth()], value };
  });
}

export const compact = (n: number, money = true) => {
  const s = Math.abs(n) >= 1000 ? `${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  return money ? `R$ ${s}` : s;
};

export const initials = (name: string) =>
  name
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?';

