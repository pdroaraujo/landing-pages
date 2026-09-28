import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, MousePointerClick } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { S7CardStore, S7CardTag } from '../../lib/s7card';
import { linkTypeInfo } from '../../lib/s7card';
import { brl, fullDate } from '../../lib/format';
import { Card, PageHeader, Badge } from '../../components/admin/ui';
import S7CardTagForm from '../../components/admin/S7CardTagForm';

export default function S7CardLojaDetalhe() {
  const { id } = useParams();
  const [store, setStore] = useState<S7CardStore | null>(null);
  const [tags, setTags] = useState<S7CardTag[]>([]);
  const [taps, setTaps] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: t }] = await Promise.all([
      supabase.from('s7card_stores').select('*').eq('id', id).single(),
      supabase.from('s7card_tags').select('*').eq('store_id', id).order('created_at', { ascending: false }),
    ]);
    setStore(s as S7CardStore);
    const tagList = (t as S7CardTag[]) ?? [];
    setTags(tagList);
    if (tagList.length) {
      const { data: tapRows } = await supabase
        .from('s7card_taps')
        .select('tag_id')
        .in('tag_id', tagList.map((x) => x.id));
      const counts: Record<string, number> = {};
      (tapRows ?? []).forEach((r: { tag_id: string }) => {
        counts[r.tag_id] = (counts[r.tag_id] ?? 0) + 1;
      });
      setTaps(counts);
    }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/r/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  if (loading || !store) return <p className="text-sm text-white/40">Carregando…</p>;

  return (
    <div>
      <Link to="/s7card/lojas" className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">
        <ArrowLeft size={14} /> Lojas
      </Link>
      <PageHeader
        title={store.name}
        subtitle={`${[store.category, store.city, store.uf].filter(Boolean).join(' · ')} · vendida em ${fullDate(store.sold_at)} por ${brl(store.sold_value)}`}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div>
          <h3 className="mb-4 font-bold tracking-tight">Placas dessa loja</h3>
          {tags.length === 0 ? (
            <Card className="p-8 text-center text-sm text-white/35">Nenhuma placa vinculada ainda.</Card>
          ) : (
            <div className="grid gap-3">
              {tags.map((t) => {
                const info = linkTypeInfo(t.link_type);
                return (
                  <Card key={t.id} className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{t.label || info.label}</span>
                          <Badge tone={t.status === 'instalada' ? 'green' : t.status === 'defeito' ? 'red' : 'default'}>{t.status}</Badge>
                          <Badge tone="blue">{info.label}</Badge>
                        </div>
                        <p className="mt-1 truncate max-w-md text-xs text-white/40">{t.destination}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1 text-xs text-white/50">
                          <MousePointerClick size={13} /> {taps[t.id] ?? 0} toques
                        </span>
                        <button
                          onClick={() => copyLink(t.code)}
                          className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10"
                        >
                          {copied === t.code ? <Check size={13} /> : <Copy size={13} />} /r/{t.code}
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <Card className="p-6 h-fit">
          <h3 className="font-bold tracking-tight mb-4">Vincular nova placa</h3>
          <S7CardTagForm storeId={store.id} onCreated={load} />
        </Card>
      </div>
    </div>
  );
}
