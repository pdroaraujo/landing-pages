import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, MousePointerClick, Trash2, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { S7CardStore, S7CardTag } from '../../lib/s7card';
import { linkTypeInfo } from '../../lib/s7card';
import { brl, fullDate } from '../../lib/format';
import { Card, PageHeader, Badge, inputClass, Btn } from '../../components/admin/ui';
import S7CardTagForm from '../../components/admin/S7CardTagForm';

export default function S7CardLojaDetalhe() {
  const { id } = useParams();
  const [store, setStore] = useState<S7CardStore | null>(null);
  const [tags, setTags] = useState<S7CardTag[]>([]);
  const [taps, setTaps] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [reviewsInput, setReviewsInput] = useState('');
  const [savingReviews, setSavingReviews] = useState(false);

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

  const removeTag = async (tagId: string, label: string) => {
    if (!confirm(`Apagar a placa "${label}"? Os toques registrados dela também somem. Não dá pra desfazer.`)) return;
    await supabase.from('s7card_tags').delete().eq('id', tagId);
    load();
  };

  const updateReviews = async () => {
    if (!store || !reviewsInput) return;
    setSavingReviews(true);
    const today = new Date().toISOString().slice(0, 10);
    const patch: Record<string, unknown> = { reviews_current: Number(reviewsInput), reviews_updated_at: today };
    if (store.reviews_baseline === null) {
      patch.reviews_baseline = Number(reviewsInput);
      patch.reviews_baseline_at = today;
    }
    await supabase.from('s7card_stores').update(patch).eq('id', store.id);
    setSavingReviews(false);
    setReviewsInput('');
    load();
  };

  if (loading || !store) return <p className="text-sm text-white/40">Carregando…</p>;

  const totalTaps = tags.reduce((a, t) => a + (taps[t.id] ?? 0), 0);
  const delta =
    store.reviews_baseline !== null && store.reviews_current !== null ? store.reviews_current - store.reviews_baseline : null;

  return (
    <div>
      <Link to="/s7card/mapeamento" className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">
        <ArrowLeft size={14} /> Mapeamento
      </Link>
      <PageHeader
        title={store.name}
        subtitle={`${[store.category, store.city, store.uf].filter(Boolean).join(' · ')} · vendida em ${fullDate(store.sold_at)} por ${brl(store.sold_value)}`}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold tracking-tight">Placas dessa loja</h3>
            <span className="inline-flex items-center gap-1 text-xs text-white/50">
              <MousePointerClick size={13} /> {totalTaps} toques no total
            </span>
          </div>
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
                        <button
                          onClick={() => removeTag(t.id, t.label || info.label)}
                          className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-2 text-xs font-bold text-white/50 hover:bg-[#fe0000]/20 hover:text-[#ff5a5a]"
                          title="Apagar placa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <Card className="p-6">
            <h3 className="font-bold tracking-tight mb-4 flex items-center gap-2">
              <Star size={16} className="text-[#fe0000]" /> Avaliações no Google
            </h3>
            {store.reviews_baseline === null ? (
              <p className="mb-3 text-xs text-white/40">Nenhuma contagem registrada ainda.</p>
            ) : (
              <p className="mb-3 text-sm text-white/70">
                {store.reviews_baseline} na instalação ({fullDate(store.reviews_baseline_at!)}) → {store.reviews_current ?? '?'} agora
                {store.reviews_updated_at && ` (${fullDate(store.reviews_updated_at)})`}
                {delta !== null && (
                  <span className={delta > 0 ? 'text-emerald-400 font-bold' : 'text-white/50'}> · {delta >= 0 ? '+' : ''}{delta}</span>
                )}
              </p>
            )}
            <div className="flex gap-2">
              <input
                type="number"
                value={reviewsInput}
                onChange={(e) => setReviewsInput(e.target.value)}
                className={inputClass}
                placeholder="Nº de avaliações hoje"
              />
              <Btn onClick={updateReviews} disabled={!reviewsInput || savingReviews} className="shrink-0">
                {savingReviews ? 'Salvando...' : 'Atualizar'}
              </Btn>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold tracking-tight mb-4">Vincular nova placa</h3>
            <S7CardTagForm storeId={store.id} storeHasReviewsBaseline={store.reviews_baseline !== null} onCreated={load} />
          </Card>
        </div>
      </div>
    </div>
  );
}
