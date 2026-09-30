import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy, Check, Upload, Trash2, PhoneCall, Ban, DollarSign, Undo2, Plus,
  MousePointerClick, Star, ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { S7CardProspect, ProspectStatus, S7CardStore } from '../../lib/s7card';
import { prospectDedupKey } from '../../lib/s7card';
import { parseImportFile } from '../../lib/importParse';
import { buildGenericImportPrompt } from '../../lib/prospectPrompt';
import { brl, fullDate } from '../../lib/format';
import { Card, PageHeader, Btn, Field, inputClass, Badge } from '../../components/admin/ui';

type Tab = 'a_prospectar' | 'prospectado' | 'vendido' | 'descartado' | 'todas';

const STATUS_LABEL: Record<ProspectStatus, string> = {
  a_prospectar: 'A prospectar',
  prospectado: 'Prospectado',
  vendido: 'Vendido',
  descartado: 'Descartado',
};
const STATUS_TONE: Record<ProspectStatus, 'default' | 'amber' | 'green' | 'red'> = {
  a_prospectar: 'default',
  prospectado: 'amber',
  vendido: 'green',
  descartado: 'red',
};

const emptyStore = {
  name: '', category: '', address: '', city: '', uf: '', contact_name: '', contact_phone: '',
  sold_value: '', sold_at: new Date().toISOString().slice(0, 10), reviews_baseline: '',
};

export default function S7CardMapeamento() {
  const [prospects, setProspects] = useState<S7CardProspect[]>([]);
  const [stores, setStores] = useState<S7CardStore[]>([]);
  const [storeTaps, setStoreTaps] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('a_prospectar');

  // painel de importação
  const [showImport, setShowImport] = useState(false);
  const [ramo, setRamo] = useState('');
  const [city, setCity] = useState('');
  const [uf, setUf] = useState('');
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // cadastro direto de loja (sem passar pelo pipeline)
  const [showNewStore, setShowNewStore] = useState(false);
  const [storeForm, setStoreForm] = useState(emptyStore);
  const [newStatus, setNewStatus] = useState<ProspectStatus>('a_prospectar');
  const [savingStore, setSavingStore] = useState(false);

  // marcar prospect como vendido
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [sellForm, setSellForm] = useState({ value: '', sold_at: new Date().toISOString().slice(0, 10), reviews_baseline: '' });

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: s }, { data: tapRows }] = await Promise.all([
      supabase.from('s7card_prospects').select('*').order('created_at', { ascending: false }),
      supabase.from('s7card_stores').select('*').order('created_at', { ascending: false }),
      supabase.from('s7card_taps').select('tag:s7card_tags(store_id)'),
    ]);
    setProspects((p as S7CardProspect[]) ?? []);
    setStores((s as S7CardStore[]) ?? []);
    const counts: Record<string, number> = {};
    (tapRows as unknown as { tag: { store_id: string | null } | null }[] ?? []).forEach((r) => {
      const sid = r.tag?.store_id;
      if (sid) counts[sid] = (counts[sid] ?? 0) + 1;
    });
    setStoreTaps(counts);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c: Record<ProspectStatus, number> = { a_prospectar: 0, prospectado: 0, vendido: 0, descartado: 0 };
    prospects.forEach((p) => {
      if (p.status !== 'vendido') c[p.status]++;
    });
    c.vendido = stores.length;
    return c;
  }, [prospects, stores]);

  const totalTodas = counts.a_prospectar + counts.prospectado + counts.vendido + counts.descartado;

  const copyPrompt = () => {
    navigator.clipboard.writeText(buildGenericImportPrompt(ramo, city || 'sua cidade', uf || undefined));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pickFile = async (f: File) => {
    setFile(f);
    setParsedCount(null);
    setImportMsg(null);
    try {
      const rows = await parseImportFile(f);
      setParsedCount(rows.length);
    } catch {
      setImportMsg('Não consegui ler esse arquivo. Use um .csv ou .xlsx.');
    }
  };

  const runImport = async () => {
    if (!file) return;
    setImporting(true);
    setImportMsg(null);
    try {
      const rows = await parseImportFile(file);
      if (!rows.length) {
        setImportMsg('Nenhuma empresa válida nesse arquivo.');
        return;
      }
      const { data: existing } = await supabase.from('s7card_prospects').select('dedup_key');
      const known = new Set((existing ?? []).map((r: { dedup_key: string | null }) => r.dedup_key).filter(Boolean));

      const seen = new Set<string>();
      const toInsert = [];
      for (const r of rows) {
        const key = prospectDedupKey(r.name, r.phone, r.city || city);
        if (known.has(key) || seen.has(key)) continue;
        seen.add(key);
        toInsert.push({
          dedup_key: key,
          name: r.name,
          phone: r.phone,
          address: r.address,
          city: r.city || city || null,
          uf: r.uf || uf || null,
          category: r.category,
          website: r.website,
          status: 'a_prospectar' as const,
        });
      }
      if (toInsert.length) await supabase.from('s7card_prospects').insert(toInsert);
      setImportMsg(`${toInsert.length} novos · ${rows.length - toInsert.length} já conhecidos (ignorados).`);
      setFile(null);
      setParsedCount(null);
      if (fileRef.current) fileRef.current.value = '';
      load();
    } finally {
      setImporting(false);
    }
  };

  const setStatus = async (id: string, status: ProspectStatus) => {
    await supabase.from('s7card_prospects').update({ status }).eq('id', id);
    load();
  };

  const removeProspect = async (id: string, name: string) => {
    if (!confirm(`Apagar "${name}" do mapeamento? Não dá pra desfazer.`)) return;
    await supabase.from('s7card_prospects').delete().eq('id', id);
    load();
  };

  const removeStore = async (id: string, name: string) => {
    if (!confirm(`Apagar a loja "${name}"? As placas dela ficam sem loja vinculada. Não dá pra desfazer.`)) return;
    await supabase.from('s7card_stores').delete().eq('id', id);
    load();
  };

  /** cadastrou como vendida por engano: volta pro pipeline com outra situação (a loja sai de "Vendido") */
  const unsell = async (st: S7CardStore, status: ProspectStatus) => {
    if (!confirm(`Mover "${st.name}" de Vendido para ${STATUS_LABEL[status]}? As placas dela voltam pro estoque.`)) return;
    const linked = prospects.find((p) => p.store_id === st.id);
    if (linked) {
      await supabase.from('s7card_prospects').update({ status, store_id: null }).eq('id', linked.id);
    } else {
      await supabase.from('s7card_prospects').insert({
        name: st.name,
        category: st.category,
        address: st.address,
        city: st.city,
        uf: st.uf,
        phone: st.contact_phone,
        status,
        dedup_key: prospectDedupKey(st.name, st.contact_phone, st.city),
      });
    }
    await supabase.from('s7card_tags').update({ status: 'em_estoque', installed_at: null }).eq('store_id', st.id);
    await supabase.from('s7card_stores').delete().eq('id', st.id);
    setTab(status);
    load();
  };

  const startSell = (p: S7CardProspect) => {
    setSellingId(p.id);
    setSellForm({ value: '', sold_at: new Date().toISOString().slice(0, 10), reviews_baseline: '' });
  };

  const confirmSell = async (p: S7CardProspect) => {
    const { data: store, error } = await supabase
      .from('s7card_stores')
      .insert({
        name: p.name,
        category: p.category,
        address: p.address,
        city: p.city,
        uf: p.uf,
        sold_value: Number(sellForm.value) || 0,
        sold_at: sellForm.sold_at,
        reviews_baseline: sellForm.reviews_baseline ? Number(sellForm.reviews_baseline) : null,
        reviews_baseline_at: sellForm.reviews_baseline ? sellForm.sold_at : null,
      })
      .select('id')
      .single();
    if (error || !store) return;
    await supabase.from('s7card_prospects').update({ status: 'vendido', store_id: store.id }).eq('id', p.id);
    setSellingId(null);
    load();
  };

  const addStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStore(true);
    if (newStatus !== 'vendido') {
      // ainda não comprou: vai pro pipeline (a prospectar / prospectado / descartado)
      const { error } = await supabase.from('s7card_prospects').insert({
        name: storeForm.name,
        category: storeForm.category || null,
        address: storeForm.address || null,
        city: storeForm.city || null,
        uf: storeForm.uf || null,
        phone: storeForm.contact_phone || null,
        notes: storeForm.contact_name ? `Contato: ${storeForm.contact_name}` : null,
        status: newStatus,
        dedup_key: prospectDedupKey(storeForm.name, storeForm.contact_phone || null, storeForm.city || null),
      });
      setSavingStore(false);
      if (error) {
        alert(error.message.includes('duplicate') ? 'Esse estabelecimento já está no mapeamento.' : error.message);
        return;
      }
      setStoreForm(emptyStore);
      setShowNewStore(false);
      setTab(newStatus);
      load();
      return;
    }
    const { error } = await supabase.from('s7card_stores').insert({
      name: storeForm.name,
      category: storeForm.category || null,
      address: storeForm.address || null,
      city: storeForm.city || null,
      uf: storeForm.uf || null,
      contact_name: storeForm.contact_name || null,
      contact_phone: storeForm.contact_phone || null,
      sold_value: Number(storeForm.sold_value) || 0,
      sold_at: storeForm.sold_at,
      reviews_baseline: storeForm.reviews_baseline ? Number(storeForm.reviews_baseline) : null,
      reviews_baseline_at: storeForm.reviews_baseline ? storeForm.sold_at : null,
    });
    setSavingStore(false);
    if (!error) {
      setStoreForm(emptyStore);
      setShowNewStore(false);
      load();
    }
  };

  return (
    <div>
      <PageHeader
        title="Mapeamento"
        subtitle="Estabelecimentos-alvo pra vender a placa S7 Card — quem prospectar, quem já foi visitado, quem comprou."
        actions={
          <>
            <Btn variant="outline" onClick={() => setShowNewStore((s) => !s)}>
              <Plus size={14} /> Adicionar estabelecimento
            </Btn>
            <Btn onClick={() => setShowImport((s) => !s)}>
              <Upload size={14} /> Importar lista
            </Btn>
          </>
        }
      />

      {showNewStore && (
        <Card className="p-6 mb-6">
          <h3 className="font-bold tracking-tight mb-4">Adicionar estabelecimento</h3>
          <div className="mb-5">
            <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-white/50">Situação</span>
            <div className="inline-flex flex-wrap rounded-full border border-white/10 bg-white/[0.03] p-1">
              {(['a_prospectar', 'prospectado', 'vendido', 'descartado'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setNewStatus(st)}
                  className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest ${
                    newStatus === st ? 'bg-[#fe0000] text-white' : 'text-white/45 hover:text-white'
                  }`}
                >
                  {STATUS_LABEL[st]}
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={addStore} className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da loja">
              <input required value={storeForm.name} onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Categoria">
              <input value={storeForm.category} onChange={(e) => setStoreForm({ ...storeForm, category: e.target.value })} className={inputClass} placeholder="Ex: Restaurante" />
            </Field>
            <Field label="Endereço">
              <input value={storeForm.address} onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })} className={inputClass} />
            </Field>
            <div className="grid grid-cols-[1fr_90px] gap-3">
              <Field label="Cidade">
                <input value={storeForm.city} onChange={(e) => setStoreForm({ ...storeForm, city: e.target.value })} className={inputClass} />
              </Field>
              <Field label="UF">
                <input value={storeForm.uf} onChange={(e) => setStoreForm({ ...storeForm, uf: e.target.value.toUpperCase() })} maxLength={2} className={inputClass} />
              </Field>
            </div>
            <Field label="Contato">
              <input value={storeForm.contact_name} onChange={(e) => setStoreForm({ ...storeForm, contact_name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Telefone">
              <input value={storeForm.contact_phone} onChange={(e) => setStoreForm({ ...storeForm, contact_phone: e.target.value })} className={inputClass} />
            </Field>
            {newStatus === 'vendido' && (
              <>
                <Field label="Valor da venda (R$)">
                  <input type="number" step="0.01" value={storeForm.sold_value} onChange={(e) => setStoreForm({ ...storeForm, sold_value: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Data da venda">
                  <input type="date" value={storeForm.sold_at} onChange={(e) => setStoreForm({ ...storeForm, sold_at: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Avaliações no Google hoje (opcional)">
                  <input type="number" value={storeForm.reviews_baseline} onChange={(e) => setStoreForm({ ...storeForm, reviews_baseline: e.target.value })} className={inputClass} placeholder="Ex: 12" />
                </Field>
              </>
            )}
            <Btn type="submit" disabled={savingStore} className="sm:col-span-2 self-start">
              {savingStore ? 'Salvando...' : newStatus === 'vendido' ? 'Cadastrar loja vendida' : `Adicionar em ${STATUS_LABEL[newStatus]}`}
            </Btn>
          </form>
        </Card>
      )}

      {showImport && (
        <Card className="p-6 mb-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Tipo de estabelecimento">
              <input value={ramo} onChange={(e) => setRamo(e.target.value)} className={inputClass} placeholder="Ex: barbearias e salões de beleza" />
            </Field>
            <Field label="Cidade">
              <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Ex: Santos" />
            </Field>
            <Field label="UF">
              <input value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} maxLength={2} className={inputClass} />
            </Field>
          </div>

          <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-widest text-white/50">1. Peça pro Claude gerar a lista</p>
          <div className="relative">
            <textarea
              readOnly
              value={buildGenericImportPrompt(ramo, city || 'sua cidade', uf || undefined)}
              rows={6}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/70"
            />
            <button
              onClick={copyPrompt}
              className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-white/20"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-widest text-white/50">2. Suba o arquivo (.csv ou .xlsx)</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls,text/csv"
            onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])}
            className="block w-full text-xs text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-[#fe0000] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:text-white"
          />
          {parsedCount !== null && <p className="mt-2 text-xs text-white/50">{parsedCount} empresas lidas de "{file?.name}".</p>}
          {importMsg && <p className="mt-2 text-xs text-emerald-400">{importMsg}</p>}

          <Btn onClick={runImport} disabled={!file || importing} className="mt-4">
            <Upload size={14} /> {importing ? 'Importando...' : 'Importar pro mapeamento'}
          </Btn>
        </Card>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {(['a_prospectar', 'prospectado', 'vendido', 'descartado', 'todas'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest border ${
              tab === t ? 'bg-[#fe0000] text-white border-[#fe0000]' : 'border-white/10 text-white/45 hover:text-white'
            }`}
          >
            {t === 'todas' ? `Todas (${totalTodas})` : `${STATUS_LABEL[t]} (${counts[t]})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-white/40">Carregando…</p>
      ) : (
        <div className="grid gap-3">
          {/* --- lojas vendidas --- */}
          {(tab === 'vendido' || tab === 'todas') &&
            stores.map((s) => {
              const delta =
                s.reviews_baseline !== null && s.reviews_current !== null ? s.reviews_current - s.reviews_baseline : null;
              return (
                <Card key={s.id} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold">{s.name}</span>
                        <Badge tone="green">Vendido</Badge>
                      </div>
                      <p className="mt-1 text-xs text-white/40">
                        {[s.category, s.city, s.uf].filter(Boolean).join(' · ')} · vendida em {fullDate(s.sold_at)} · {brl(s.sold_value)}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/50">
                        <span className="inline-flex items-center gap-1">
                          <MousePointerClick size={12} /> {storeTaps[s.id] ?? 0} toques
                        </span>
                        {s.reviews_baseline !== null && (
                          <span className="inline-flex items-center gap-1">
                            <Star size={12} /> {s.reviews_baseline} → {s.reviews_current ?? '?'} avaliações
                            {delta !== null && ` (${delta >= 0 ? '+' : ''}${delta})`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/s7card/lojas/${s.id}`} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10">
                        Ver loja <ChevronRight size={13} />
                      </Link>
                      <button
                        onClick={() => unsell(s, 'prospectado')}
                        className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white/60 hover:bg-white/10"
                        title="Não fechou ainda: volta pra Prospectado"
                      >
                        <Undo2 size={13} /> Não vendeu
                      </button>
                      <button
                        onClick={() => unsell(s, 'descartado')}
                        className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white/60 hover:bg-[#fe0000]/20 hover:text-[#ff5a5a]"
                        title="Mover para Descartado"
                      >
                        <Ban size={13} /> Descartar
                      </button>
                      <button onClick={() => removeStore(s.id, s.name)} className="rounded-lg bg-white/5 p-2.5 text-white/40 hover:bg-[#fe0000]/20 hover:text-[#ff5a5a]" title="Apagar loja">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}

          {/* --- pipeline de prospecção --- */}
          {prospects
            .filter((p) => p.status !== 'vendido' && (tab === 'todas' || tab === p.status))
            .map((p) => (
              <Card key={p.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{p.name}</span>
                      <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-white/40">
                      {[p.category, p.city, p.uf].filter(Boolean).join(' · ')}
                      {p.phone ? ` · ${p.phone}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {p.status === 'a_prospectar' && (
                      <button onClick={() => setStatus(p.id, 'prospectado')} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10">
                        <PhoneCall size={13} /> Marcar prospectado
                      </button>
                    )}
                    <button onClick={() => startSell(p)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25">
                      <DollarSign size={13} /> Vendido
                    </button>
                    {p.status !== 'descartado' && (
                      <button onClick={() => setStatus(p.id, 'descartado')} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white/50 hover:bg-white/10">
                        <Ban size={13} /> Descartar
                      </button>
                    )}
                    {p.status === 'descartado' && (
                      <button onClick={() => setStatus(p.id, 'a_prospectar')} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white/50 hover:bg-white/10">
                        <Undo2 size={13} /> Reabrir
                      </button>
                    )}
                    <button onClick={() => removeProspect(p.id, p.name)} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-2 text-xs font-bold text-white/50 hover:bg-[#fe0000]/20 hover:text-[#ff5a5a]" title="Apagar">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {sellingId === p.id && (
                  <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-4">
                    <Field label="Valor da venda (R$)">
                      <input type="number" step="0.01" value={sellForm.value} onChange={(e) => setSellForm({ ...sellForm, value: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Data">
                      <input type="date" value={sellForm.sold_at} onChange={(e) => setSellForm({ ...sellForm, sold_at: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Avaliações no Google hoje">
                      <input type="number" value={sellForm.reviews_baseline} onChange={(e) => setSellForm({ ...sellForm, reviews_baseline: e.target.value })} className={inputClass} placeholder="Ex: 12" />
                    </Field>
                    <div className="flex items-end gap-2">
                      <Btn onClick={() => confirmSell(p)}>Confirmar</Btn>
                      <Btn variant="ghost" onClick={() => setSellingId(null)}>Cancelar</Btn>
                    </div>
                  </div>
                )}
              </Card>
            ))}

          {((tab !== 'vendido' && prospects.filter((p) => p.status !== 'vendido' && (tab === 'todas' || tab === p.status)).length === 0) ||
            (tab === 'vendido' && stores.length === 0)) && (
            <Card className="p-10 text-center text-sm text-white/40">Nada por aqui ainda.</Card>
          )}
        </div>
      )}
    </div>
  );
}
