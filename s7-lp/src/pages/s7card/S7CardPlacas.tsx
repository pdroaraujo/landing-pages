import { useEffect, useState } from 'react';
import { Copy, Check, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { S7CardStore, S7CardTag } from '../../lib/s7card';
import { linkTypeInfo } from '../../lib/s7card';
import { Card, PageHeader, Badge, Btn } from '../../components/admin/ui';
import S7CardTagForm from '../../components/admin/S7CardTagForm';

type Tab = 'todas' | 'em_estoque' | 'instalada' | 'defeito';

export default function S7CardPlacas() {
  const [tags, setTags] = useState<S7CardTag[]>([]);
  const [stores, setStores] = useState<S7CardStore[]>([]);
  const [tab, setTab] = useState<Tab>('todas');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: t }, { data: s }] = await Promise.all([
      supabase.from('s7card_tags').select('*, store:s7card_stores(*)').order('created_at', { ascending: false }),
      supabase.from('s7card_stores').select('*').order('name'),
    ]);
    setTags((t as S7CardTag[]) ?? []);
    setStores((s as S7CardStore[]) ?? []);
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
          <Btn onClick={() => setShowForm((s) => !s)}>
            <Plus size={14} /> Nova placa
          </Btn>
        }
      />

      {showForm && (
        <Card className="p-6 mb-6">
          <h3 className="font-bold tracking-tight mb-4">Cadastrar placa (sem loja — fica em estoque)</h3>
          <S7CardTagForm
            onCreated={() => {
              load();
              setShowForm(false);
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
            return (
              <Card key={t.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{t.label || info.label}</span>
                      <Badge tone={t.status === 'instalada' ? 'green' : t.status === 'defeito' ? 'red' : 'default'}>{t.status}</Badge>
                      <Badge tone="blue">{info.label}</Badge>
                    </div>
                    <p className="mt-1 truncate max-w-md text-xs text-white/40">{t.destination}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={t.store_id ?? ''}
                      onChange={(e) => assign(t.id, e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white"
                    >
                      <option value="" className="bg-[#161616]">— sem loja —</option>
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
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
