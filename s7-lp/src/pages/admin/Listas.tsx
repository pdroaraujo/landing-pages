import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { fullDate } from '../../lib/format';
import { Card, PageHeader, Badge } from '../../components/admin/ui';

type Row = {
  id: string;
  name: string;
  date: string;
  mode: string;
  niche: string | null;
  city: string | null;
  total: number;
  done: number;
  mine: number;
};

export default function Listas() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<'todas' | 'minhas'>(profile?.role === 'admin' ? 'todas' : 'minhas');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('list_overview')
        .select('*')
        .order('date', { ascending: false });
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const visible = rows.filter((r) => (scope === 'minhas' ? r.mine > 0 : true));

  return (
    <div>
      <PageHeader
        title="Listas de Prospecção"
        subtitle="Filas de ligação. Meta: 100 contatos/dia divididos entre a equipe."
        actions={
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
            {(['todas', 'minhas'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest ${
                  scope === s ? 'bg-[#fe0000] text-white' : 'text-white/45'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <p className="text-sm text-white/40">Carregando…</p>
      ) : visible.length === 0 ? (
        <Card className="p-10 text-center text-sm text-white/40">
          <ListChecks className="mx-auto mb-3 text-white/20" size={28} />
          Nenhuma lista ainda. Gere uma em <Link to="/admin/prospeccao" className="text-[#fe0000]">Prospecção</Link>.
        </Card>
      ) : (
        <div className="grid gap-3">
          {visible.map((r) => {
            const pct = r.total ? Math.round((r.done / r.total) * 100) : 0;
            return (
              <Link key={r.id} to={`/admin/listas/${r.id}`}>
                <Card className="flex items-center gap-4 p-5 hover:border-[#fe0000]/40 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{r.name}</span>
                      <Badge tone="red">{r.mode}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-white/40">
                      {fullDate(r.date)} · {r.total} empresas · {r.done}/{r.total} contatadas ({pct}%)
                    </p>
                    <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-[#fe0000]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <ChevronRight className="text-white/30" size={18} />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
