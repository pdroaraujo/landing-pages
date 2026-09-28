import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, ChevronRight, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fullDate } from '../../lib/format';
import { Card, PageHeader, Badge } from '../../components/admin/ui';

type Row = {
  id: string;
  name: string;
  date: string;
  mode: string;
  total: number;
  done: number;
  mine: number;
  pending_qual: number;
  approved: number;
  rejected: number;
};

export default function Listas() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('list_overview').select('*').order('date', { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Apagar a lista "${name}"? As empresas ficam salvas (não prospectamos de novo), só a lista some. Não dá pra desfazer.`)) return;
    await supabase.from('lists').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Listas de Prospecção"
        subtitle="Cada busca gera uma lista. Qualifique os leads (aprovar/rejeitar) e distribua os aprovados para a equipe."
      />

      {loading ? (
        <p className="text-sm text-white/40">Carregando…</p>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-sm text-white/40">
          <ListChecks className="mx-auto mb-3 text-white/20" size={28} />
          Nenhuma lista ainda. Gere uma em{' '}
          <Link to="/admin/prospeccao" className="text-[#fe0000]">Prospecção</Link>.
        </Card>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => {
            const qualified = r.approved + r.rejected;
            const pct = r.total ? Math.round((qualified / r.total) * 100) : 0;
            const callPct = r.approved ? Math.round((r.done / r.approved) * 100) : 0;
            return (
              <Link key={r.id} to={`/admin/listas/${r.id}`}>
                <Card className="flex items-center gap-4 p-5 hover:border-[#fe0000]/40 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{r.name}</span>
                      <Badge tone="red">{r.mode}</Badge>
                      {r.pending_qual > 0 && <Badge tone="amber">{r.pending_qual} a qualificar</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-white/40">
                      {fullDate(r.date)} · {r.total} empresas · {r.approved} aprovadas · {r.rejected} rejeitadas
                      {r.approved > 0 && ` · ${r.done}/${r.approved} contatadas`}
                    </p>
                    <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#fe0000]"
                        style={{ width: `${r.pending_qual > 0 ? pct : callPct}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={(e) => remove(e, r.id, r.name)}
                    className="rounded-lg bg-white/5 p-2.5 text-white/40 hover:bg-[#fe0000]/20 hover:text-[#ff5a5a]"
                    title="Apagar lista"
                  >
                    <Trash2 size={15} />
                  </button>
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
