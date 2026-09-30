import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Plus, Trash2, Pencil, MousePointerClick, Layers, Store, Undo2, Link2, X, Repeat } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { S7CardStore, S7CardTag } from '../../lib/s7card';
import { LINK_TYPES, linkTypeInfo, type LinkType } from '../../lib/s7card';
import { brl } from '../../lib/format';
import { Card, PageHeader, Badge, Btn, Field, inputClass } from '../../components/admin/ui';
import Select from '../../components/admin/Select';
import S7CardTagForm from '../../components/admin/S7CardTagForm';
import S7CardBulkForm from '../../components/admin/S7CardBulkForm';

type Tab = 'todas' | 'em_estoque' | 'instalada' | 'revenda' | 'defeito';

const STATUS_LABEL: Record<S7CardTag['status'], string> = {
  em_estoque: 'Em estoque',
  instalada: 'Instalada',
  revenda: 'Revenda',
  defeito: 'Defeito',
};

const STATUS_TONE: Record<S7CardTag['status'], 'default' | 'green' | 'red' | 'amber'> = {
  em_estoque: 'default',
  instalada: 'green',
  revenda: 'amber',
  defeito: 'red',
};

type EditForm = { link_type: LinkType; destination: string; label: string; sold_value: string; quantity: string };

export default function S7CardPlacas() {
  const [tags, setTags] = useState<S7CardTag[]>([]);
  const [stores, setStores] = useState<S7CardStore[]>([]);
  const [taps, setTaps] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<Tab>('todas');
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'nenhum' | 'nova' | 'lote'>('nenhum');
  const [copied, setCopied] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [linking, setLinking] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  /** vincula a placa a uma loja (vira "instalada") */
  const linkToStore = async (tagId: string, storeId: string) => {
    if (!storeId) return;
    await supabase
      .from('s7card_tags')
      .update({ store_id: storeId, status: 'instalada', installed_at: new Date().toISOString().slice(0, 10) })
      .eq('id', tagId);
    setLinking(null);
    load();
  };

  /** tira a placa da loja e devolve pro estoque (ex: loja cancelou, placa foi trocada) */
  const backToStock = async (tagId: string, storeName: string) => {
    if (!confirm(`Tirar essa placa da loja "${storeName}" e devolver pro estoque? Os toques já registrados continuam salvos.`)) return;
    await supabase.from('s7card_tags').update({ store_id: null, status: 'em_estoque', installed_at: null }).eq('id', tagId);
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
    setEditForm({
      link_type: t.link_type,
      destination: t.destination,
      label: t.label ?? '',
      sold_value: t.sold_value ? String(t.sold_value) : '',
      quantity: String(t.quantity ?? 1),
    });
  };

  const saveEdit = async (tagId: string) => {
    if (!editForm) return;
    await supabase
      .from('s7card_tags')
      .update({
        link_type: editForm.link_type,
        destination: editForm.destination,
        label: editForm.label || null,
        sold_value: Number(editForm.sold_value) || 0,
        quantity: Math.max(1, Number(editForm.quantity) || 1),
      })
      .eq('id', tagId);
    setEditing(null);
    load();
  };

  // ---- seleção em massa ----
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const bulk = async (action: 'apagar' | 'estoque' | 'revenda') => {
    const ids = [...selected];
    if (!ids.length) return;
    const n = ids.length;
    if (action === 'apagar') {
      if (!confirm(`Apagar ${n} placa${n > 1 ? 's' : ''}? Os toques registrados delas também somem. Não dá pra desfazer.`)) return;
      await supabase.from('s7card_tags').delete().in('id', ids);
    } else if (action === 'estoque') {
      await supabase.from('s7card_tags').update({ store_id: null, status: 'em_estoque', installed_at: null }).in('id', ids);
    } else {
      await supabase.from('s7card_tags').update({ store_id: null, status: 'revenda', installed_at: null }).in('id', ids);
    }
    setSelected(new Set());
    load();
  };

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/r/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const visible = tags.filter((t) => tab === 'todas' || t.status === tab);
  const allSelected = visible.length > 0 && visible.every((t) => selected.has(t.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(visible.map((t) => t.id)));
  const storeOptions = stores.map((s) => ({ value: s.id, label: s.name, hint: s.city ?? undefined }));
  const iconBtn = 'inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10';

  return (
    <div>
      <PageHeader
        title="Placas"
        subtitle="Inventário de todas as placas NFC. Placa em estoque ainda não está em nenhuma loja; ao vincular a uma loja ela vira instalada."
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
          <h3 className="font-bold tracking-tight mb-1">Nova placa</h3>
          <p className="mb-4 text-xs text-white/40">Entra no estoque. Pra já criar dentro de uma loja, use a página da loja.</p>
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
        {(['todas', 'em_estoque', 'instalada', 'revenda', 'defeito'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setSelected(new Set());
            }}
            className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest ${
              tab === t ? 'bg-[#fe0000] text-white' : 'text-white/45'
            }`}
          >
            {t === 'todas' ? 'Todas' : STATUS_LABEL[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-white/40">Carregando…</p>
      ) : visible.length === 0 ? (
        <Card className="p-10 text-center text-sm text-white/40">Nenhuma placa nessa categoria.</Card>
      ) : (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-[#fe0000]" />
              Selecionar todas ({visible.length})
            </label>
            {selected.size > 0 && (
              <>
                <span className="text-xs text-white/40">
                  {selected.size} selecionada{selected.size > 1 ? 's' : ''}
                </span>
                <div className="ml-auto flex flex-wrap gap-2">
                  <button onClick={() => bulk('estoque')} className={iconBtn}>
                    <Undo2 size={13} /> Devolver ao estoque
                  </button>
                  <button onClick={() => bulk('revenda')} className={iconBtn}>
                    <Repeat size={13} /> Mover pra revenda
                  </button>
                  <button
                    onClick={() => bulk('apagar')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#fe0000]/15 px-3 py-2 text-xs font-bold text-[#ff5a5a] hover:bg-[#fe0000]/25"
                  >
                    <Trash2 size={13} /> Apagar selecionadas
                  </button>
                  <button onClick={() => setSelected(new Set())} className="px-2 text-xs text-white/40 hover:text-white">
                    Limpar
                  </button>
                </div>
              </>
            )}
          </div>
          {visible.map((t) => {
            const info = linkTypeInfo(t.link_type);
            const isEditing = editing === t.id;
            return (
              <Card key={t.id} className={`p-5 ${selected.has(t.id) ? 'ring-1 ring-[#fe0000]/60' : ''}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selected.has(t.id)}
                    onChange={() => toggle(t.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#fe0000]"
                    aria-label="Selecionar placa"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{t.label || info.label}</span>
                      {t.quantity > 1 && <Badge tone="default">{t.quantity} placas</Badge>}
                      <Badge tone={STATUS_TONE[t.status]}>
                        {STATUS_LABEL[t.status]}
                      </Badge>
                      <Badge tone="blue">{info.label}</Badge>
                    </div>
                    <p className="mt-1 truncate max-w-md text-xs text-white/40">{t.destination}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50">
                      {t.store ? (
                        <Link to={`/s7card/lojas/${t.store.id}`} className="inline-flex items-center gap-1 text-white/80 hover:text-white">
                          <Store size={12} /> {t.store.name}
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-white/35">
                          <Store size={12} /> {t.status === 'revenda' ? 'Separada pra revenda' : 'Ainda não está em nenhuma loja'}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <MousePointerClick size={12} /> {taps[t.id] ?? 0} toques
                      </span>
                      {t.sold_value > 0 && <span>Vendida por {brl(t.sold_value)}</span>}
                    </div>
                  </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {t.store ? (
                      <button onClick={() => backToStock(t.id, t.store?.name ?? '')} className={iconBtn} title="Tirar da loja e devolver pro estoque">
                        <Undo2 size={13} /> Devolver ao estoque
                      </button>
                    ) : (
                      <button onClick={() => setLinking(linking === t.id ? null : t.id)} className={iconBtn}>
                        <Link2 size={13} /> Vincular a uma loja
                      </button>
                    )}
                    <div className="w-36">
                      <Select
                        size="sm"
                        value={t.status}
                        onChange={(v) => setStatus(t.id, v as S7CardTag['status'])}
                        options={(Object.keys(STATUS_LABEL) as S7CardTag['status'][]).map((k) => ({ value: k, label: STATUS_LABEL[k] }))}
                      />
                    </div>
                    <button onClick={() => copyLink(t.code)} className={iconBtn}>
                      {copied === t.code ? <Check size={13} /> : <Copy size={13} />} /r/{t.code}
                    </button>
                    <button onClick={() => (isEditing ? setEditing(null) : startEdit(t))} className={iconBtn} title="Editar placa">
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

                {linking === t.id && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                    <span className="text-xs text-white/50">Em qual loja essa placa foi instalada?</span>
                    <div className="w-72">
                      {storeOptions.length ? (
                        <Select value="" onChange={(v) => linkToStore(t.id, v)} options={storeOptions} placeholder="Escolha a loja" searchable />
                      ) : (
                        <p className="text-xs text-white/35">Nenhuma loja cadastrada ainda (cadastre em Mapeamento).</p>
                      )}
                    </div>
                    <button onClick={() => setLinking(null)} className="text-white/40 hover:text-white" aria-label="Cancelar">
                      <X size={16} />
                    </button>
                  </div>
                )}

                {isEditing && editForm && (
                  <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Field label="Tipo">
                      <Select
                        value={editForm.link_type}
                        onChange={(v) => setEditForm({ ...editForm, link_type: v as LinkType })}
                        options={LINK_TYPES.map((lt) => ({ value: lt.key, label: lt.label }))}
                      />
                    </Field>
                    <Field label="Destino">
                      <input value={editForm.destination} onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Apelido">
                      <input value={editForm.label} onChange={(e) => setEditForm({ ...editForm, label: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Valor vendido (R$)">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={editForm.sold_value}
                        onChange={(e) => setEditForm({ ...editForm, sold_value: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Quantidade">
                      <input
                        type="number"
                        min={1}
                        value={editForm.quantity}
                        onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Btn onClick={() => saveEdit(t.id)} className="self-start sm:col-span-2 lg:col-span-5">
                      Salvar
                    </Btn>
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
