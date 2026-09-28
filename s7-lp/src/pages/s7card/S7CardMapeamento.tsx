import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Upload, Trash2, PhoneCall, Ban, DollarSign, ArrowRight, Undo2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { S7CardProspect, ProspectStatus } from '../../lib/s7card';
import { prospectDedupKey } from '../../lib/s7card';
import { parseImportFile } from '../../lib/importParse';
import { buildGenericImportPrompt } from '../../lib/prospectPrompt';
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

export default function S7CardMapeamento() {
  const [prospects, setProspects] = useState<S7CardProspect[]>([]);
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

  // marcar como vendido
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [sellForm, setSellForm] = useState({ value: '', sold_at: new Date().toISOString().slice(0, 10) });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('s7card_prospects').select('*').order('created_at', { ascending: false });
    setProspects((data as S7CardProspect[]) ?? []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c: Record<ProspectStatus, number> = { a_prospectar: 0, prospectado: 0, vendido: 0, descartado: 0 };
    prospects.forEach((p) => c[p.status]++);
    return c;
  }, [prospects]);

  const visible = tab === 'todas' ? prospects : prospects.filter((p) => p.status === tab);

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

  const remove = async (id: string, name: string) => {
    if (!confirm(`Apagar "${name}" do mapeamento? Não dá pra desfazer.`)) return;
    await supabase.from('s7card_prospects').delete().eq('id', id);
    load();
  };

  const startSell = (p: S7CardProspect) => {
    setSellingId(p.id);
    setSellForm({ value: '', sold_at: new Date().toISOString().slice(0, 10) });
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
      })
      .select('id')
      .single();
    if (error || !store) return;
    await supabase.from('s7card_prospects').update({ status: 'vendido', store_id: store.id }).eq('id', p.id);
    setSellingId(null);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Mapeamento"
        subtitle="Estabelecimentos-alvo pra vender a placa S7 Card — quem prospectar, quem já foi visitado, quem comprou."
        actions={
          <Btn onClick={() => setShowImport((s) => !s)}>
            <Upload size={14} /> Importar lista
          </Btn>
        }
      />

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
            {t === 'todas' ? `Todas (${prospects.length})` : `${STATUS_LABEL[t]} (${counts[t]})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-white/40">Carregando…</p>
      ) : visible.length === 0 ? (
        <Card className="p-10 text-center text-sm text-white/40">Nada por aqui — importe uma lista pra começar.</Card>
      ) : (
        <div className="grid gap-3">
          {visible.map((p) => (
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
                  {p.status === 'vendido' && p.store_id && (
                    <Link to={`/s7card/lojas/${p.store_id}`} className="mt-1 inline-flex items-center gap-1 text-xs text-[#fe0000]">
                      Ver loja <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {p.status === 'a_prospectar' && (
                    <button onClick={() => setStatus(p.id, 'prospectado')} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10">
                      <PhoneCall size={13} /> Marcar prospectado
                    </button>
                  )}
                  {p.status !== 'vendido' && (
                    <button onClick={() => startSell(p)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25">
                      <DollarSign size={13} /> Vendido
                    </button>
                  )}
                  {p.status !== 'descartado' && p.status !== 'vendido' && (
                    <button onClick={() => setStatus(p.id, 'descartado')} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white/50 hover:bg-white/10">
                      <Ban size={13} /> Descartar
                    </button>
                  )}
                  {p.status === 'descartado' && (
                    <button onClick={() => setStatus(p.id, 'a_prospectar')} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white/50 hover:bg-white/10">
                      <Undo2 size={13} /> Reabrir
                    </button>
                  )}
                  <button onClick={() => remove(p.id, p.name)} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-2 text-xs font-bold text-white/50 hover:bg-[#fe0000]/20 hover:text-[#ff5a5a]" title="Apagar">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {sellingId === p.id && (
                <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
                  <Field label="Valor da venda (R$)">
                    <input type="number" step="0.01" value={sellForm.value} onChange={(e) => setSellForm({ ...sellForm, value: e.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Data">
                    <input type="date" value={sellForm.sold_at} onChange={(e) => setSellForm({ ...sellForm, sold_at: e.target.value })} className={inputClass} />
                  </Field>
                  <div className="flex items-end gap-2">
                    <Btn onClick={() => confirmSell(p)}>Confirmar venda</Btn>
                    <Btn variant="ghost" onClick={() => setSellingId(null)}>Cancelar</Btn>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
