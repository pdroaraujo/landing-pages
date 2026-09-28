import { useEffect, useState } from 'react';
import { Copy, Check, Plus, Trash2, Pencil, MousePointerClick, Layers } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { S7CardStore, S7CardTag } from '../../lib/s7card';
import { LINK_TYPES, linkTypeInfo, type LinkType } from '../../lib/s7card';
import { Card, PageHeader, Badge, Btn, Field, inputClass } from '../../components/admin/ui';
import S7CardTagForm from '../../components/admin/S7CardTagForm';
import S7CardBulkForm from '../../components/admin/S7CardBulkForm';

type Tab = 'todas' | 'em_estoque' | 'instalada' | 'defeito';

export default function S7CardPlacas() {
  const [tags, setTags] = useState<S7CardTag[]>([]);
  const [stores, setStores] = useState<S7CardStore[]>([]);
  const [taps, setTaps] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<Tab>('todas');
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'nenhum' | 'nova' | 'lote'>('nenhum');
  const [copied, setCopied] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ link_type: LinkType; destination: string; label: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: t }, { data: s }, { data: tp }] = await Promise.all([
      supabase.from('s7card_tags').select('*, store:s7card_stores(*)').order('created_at', { ascending: false }),
      supabase.from('s7card_stores').select('*').order('name'),
      supabase.from('s7card_taps').select('tag_id'),
    ]);
    setTags((t as S7CardTag[]) ?? []);
    setStores((s as S7CardStore[]) ?? []);
    const counts: Record<string, number> = {};
    (tp ?? []).forEach((r: { tag_id: string }) => {
      counts[r.tag_id] = (counts[r.tag_id] ?? 0) + 1;
    });
    setTaps(counts);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const assign = async (tagId: string, storeId: string) => {
    await supabase
      .from('s7card_tags')
      .update({
        store_id: storeId || null,
        status: storeId ? 'instalada' : 'em_estoque',
        installed_at: storeId ? new Date().toISOString().slice(0, 10) : null,
      })
      .eq('id', tagId);
    load();
  };

  const setStatus = async (tagId: string, status: S7CardTag['status']) => {
    await supabase.from('s7card_tags').update({ status }).eq('id', tagId);
    load();
  };

  const remove = async (tagId: string, label: string) => {
    if (!confirm(`Apagar a placa "${label}"? Os toques registrados dela também somem. Não dá pra desfazer.`)) return;
    await supabase.from('s7card_tags').delete().eq('id', tagId);
    load();
  };

  const startEdit = (t: S7CardTag) => {
    setEditing(t.id);
    setEditForm({ link_type: t.link_type, destination: t.destination, label: t.label ?? '' });
  };

  const saveEdit = async (tagId: string) => {
    if (!editForm) return;
    await supabase
      .from('s7card_tags')
      .update({ link_type: editForm.link_type, destination: editForm.destination, label: editForm.label || null })
      .eq('id', tagId);
    setEditing(null);
    load();
  };

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/r/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const visible = tags.filter((t) => tab === 'todas' || t.status === tab);

  return (
    <div>
      <PageHeader
        title="Placas"
        subtitle="Inventário de todas as placas NFC — em estoque, instaladas ou com defeito."
        actions={
          <>
            <Btn variant="outline" onClick={() => setMode(mode === 'lote' ? 'nenhum' : 'lote')}>
              <Layers size={14} /> Adicionar em lote
            </Btn>
            <Btn onClick={() => setMode(mode === 'nova' ? 'nenhum' : 'nova')}>
              <Plus size={14} /> Nova placa
            </Btn>
          </>
        }
      />

      {mode === 'nova' && (
        <Card className="p-6 mb-6">
          <h3 className="font-bold tracking-tight mb-4">Cadastrar placa (sem loja — fica em estoque)</h3>
          <S7CardTagForm
            onCreated={() => {
              load();
              setMode('nenhum');
            }}
          />
        </Card>
      )}

      {mode === 'lote' && (
        <Card className="p-6 mb-6">
          <h3 className="font-bold tracking-tight mb-4">Adicionar placas em lote (ficam em estoque)</h3>
          <S7CardBulkForm
            onCreated={() => {
              load();
              setMode('nenhum');
            }}
          />
        </Card>
      )}

      <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
        {(['todas', 'em_estoque', 'instalada', 'defeito'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest ${
              tab === t ? 'bg-[#fe0000] text-white' : 'text-white/45'
            }`}
          >
            {t === 'todas' ? 'Todas' : t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-white/40">Carregando…</p>
      ) : visible.length === 0 ? (
        <Card className="p-10 text-center text-sm text-white/40">Nenhuma placa nessa categoria.</Card>
      ) : (
        <div className="grid gap-3">
          {visible.map((t) => {
            const info = linkTypeInfo(t.link_type);
            const isEditing = editing === t.id;
            return (
              <Card key={t.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{t.label || info.label}</span>
                      <Badge tone={t.status === 'instalada' ? 'green' : t.status === 'defeito' ? 'red' : 'default'}>{t.status}</Badge>
                      <Badge tone="blue">{info.label}</Badge>
                      {t.store?.name && <Badge tone="default">{t.store.name}</Badge>}
                    </div>
                    <p className="mt-1 truncate max-w-md text-xs text-white/40">{t.destination}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-white/50">
                      <MousePointerClick size={12} /> {taps[t.id] ?? 0} toques
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={t.store_id ?? ''}
                      onChange={(e) => assign(t.id, e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white"
                    >
                      <option value="" className="bg-[#161616]">Sem loja (fica em estoque)</option>
                      {stores.map((s) => (
                        <option key={s.id} value={s.id} className="bg-[#161616]">{s.name}</option>
                      ))}
                    </select>
                    <select
                      value={t.status}
                      onChange={(e) => setStatus(t.id, e.target.value as S7CardTag['status'])}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white"
                    >
                      <option value="em_estoque" className="bg-[#161616]">Em estoque</option>
                      <option value="instalada" className="bg-[#161616]">Instalada</option>
                      <option value="defeito" className="bg-[#161616]">Defeito</option>
                    </select>
                    <button
                      onClick={() => copyLink(t.code)}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10"
                    >
                      {copied === t.code ? <Check size={13} /> : <Copy size={13} />} /r/{t.code}
                    </button>
                    <button
                      onClick={() => (isEditing ? setEditing(null) : startEdit(t))}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-2 text-xs font-bold text-white/70 hover:bg-white/10"
                      title="Editar destino"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => remove(t.id, t.label || info.label)}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-2 text-xs font-bold text-white/50 hover:bg-[#fe0000]/20 hover:text-[#ff5a5a]"
                      title="Apagar placa"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {isEditing && editForm && (
                  <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
                    <Field label="Tipo">
                      <select
                        value={editForm.link_type}
                        onChange={(e) => setEditForm({ ...editForm, link_type: e.target.value as LinkType })}
                        className={inputClass}
                      >
                        {LINK_TYPES.map((lt) => (
                          <option key={lt.key} value={lt.key} className="bg-[#161616]">{lt.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Destino">
                      <input value={editForm.destination} onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Apelido">
                      <input value={editForm.label} onChange={(e) => setEditForm({ ...editForm, label: e.target.value })} className={inputClass} />
                    </Field>
                    <Btn onClick={() => saveEdit(t.id)} className="sm:col-span-3 self-start">Salvar</Btn>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
