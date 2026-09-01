import { useEffect, useRef, useState } from 'react';
import { Plus, Upload, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Sale } from '../../lib/types';
import { brl, fullDate } from '../../lib/format';
import { Card, PageHeader, Btn, Field, inputClass, Badge } from '../../components/admin/ui';

const PRODUTOS = ['Criação de Site', 'SEO', 'Google Meu Negócio', 'Manutenção Mensal', 'Landing Page', 'Tráfego Pago', 'Outro'];

const empty = {
  client_name: '',
  product: PRODUTOS[0],
  value: '',
  recurring: false,
  monthly_value: '',
  contract_signed: true,
  sold_at: new Date().toISOString().slice(0, 10),
};

export default function Vendas() {
  const { profile } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from('sales').select('*').order('sold_at', { ascending: false });
    setSales((data as Sale[]) ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.from('sales').insert({
      client_name: form.client_name,
      product: form.product,
      value: Number(form.value) || 0,
      recurring: form.recurring,
      monthly_value: form.recurring ? Number(form.monthly_value) || 0 : 0,
      contract_signed: form.contract_signed,
      seller: profile?.full_name ?? null,
      sold_at: form.sold_at,
      source: 'manual',
    });
    setSaving(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setForm(empty);
    load();
  };

  const del = async (id: string) => {
    await supabase.from('sales').delete().eq('id', id);
    load();
  };

  const importCsv = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const header = lines.shift()?.split(/[,;]/).map((h) => h.trim().toLowerCase()) ?? [];
    const idx = (k: string) => header.findIndex((h) => h.includes(k));
    const iName = idx('cliente') >= 0 ? idx('cliente') : idx('nome');
    const iProd = idx('produto') >= 0 ? idx('produto') : idx('servi');
    const iVal = idx('valor');
    const iRec = idx('recorr');
    const iMon = idx('mensal');
    const iDate = idx('data');

    const rows = lines.map((l) => {
      const c = l.split(/[,;]/);
      const parseMoney = (s: string) => Number((s ?? '').replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.')) || 0;
      const rec = /sim|true|1|x/i.test(c[iRec] ?? '');
      let d = (c[iDate] ?? '').trim();
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
        const [dd, mm, yy] = d.split('/');
        d = `${yy}-${mm}-${dd}`;
      }
      return {
        client_name: (c[iName] ?? '').trim() || 'Sem nome',
        product: (c[iProd] ?? '').trim() || 'Outro',
        value: parseMoney(c[iVal] ?? ''),
        recurring: rec,
        monthly_value: rec ? parseMoney(c[iMon] ?? '') : 0,
        contract_signed: true,
        seller: profile?.full_name ?? null,
        sold_at: d || new Date().toISOString().slice(0, 10),
        source: 'import' as const,
      };
    });

    if (!rows.length) {
      setMsg('CSV vazio ou sem linhas válidas.');
      return;
    }
    const { error } = await supabase.from('sales').insert(rows);
    setMsg(error ? error.message : `${rows.length} vendas importadas.`);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Vendas"
        subtitle="Cadastro de vendas que alimenta o Dashboard. Importe um CSV ou registre manualmente."
        actions={
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])}
            />
            <Btn variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload size={14} /> Importar CSV
            </Btn>
          </>
        }
      />

      {msg && (
        <p className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/70">{msg}</p>
      )}

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <Card className="p-6 h-fit">
          <h3 className="font-bold tracking-tight mb-4">Nova venda</h3>
          <form onSubmit={add} className="flex flex-col gap-4">
            <Field label="Cliente">
              <input required value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Produto">
              <select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className={inputClass}>
                {PRODUTOS.map((p) => (
                  <option key={p} className="bg-[#161616]">{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Valor (R$)">
              <input required type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={inputClass} />
            </Field>
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input type="checkbox" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} className="accent-[#fe0000]" />
              Recorrente (mensalidade)
            </label>
            {form.recurring && (
              <Field label="Mensalidade (R$)">
                <input type="number" step="0.01" value={form.monthly_value} onChange={(e) => setForm({ ...form, monthly_value: e.target.value })} className={inputClass} />
              </Field>
            )}
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input type="checkbox" checked={form.contract_signed} onChange={(e) => setForm({ ...form, contract_signed: e.target.checked })} className="accent-[#fe0000]" />
              Contrato assinado
            </label>
            <Field label="Data">
              <input type="date" value={form.sold_at} onChange={(e) => setForm({ ...form, sold_at: e.target.value })} className={inputClass} />
            </Field>
            <Btn type="submit" disabled={saving} className="mt-1">
              <Plus size={14} /> {saving ? 'Salvando...' : 'Registrar'}
            </Btn>
          </form>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-widest text-white/40">
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Produto</th>
                  <th className="px-5 py-3 font-medium">Valor</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-xs text-white/35">
                      Nenhuma venda registrada.
                    </td>
                  </tr>
                )}
                {sales.map((s) => (
                  <tr key={s.id} className="border-b border-white/5">
                    <td className="px-5 py-3 font-medium">
                      {s.client_name}
                      {s.recurring && <Badge tone="green">recorrente</Badge>}
                    </td>
                    <td className="px-5 py-3 text-white/60">{s.product}</td>
                    <td className="px-5 py-3 font-bold">{brl(s.value)}</td>
                    <td className="px-5 py-3 text-white/50">{fullDate(s.sold_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => del(s.id)} className="text-white/30 hover:text-[#fe0000]">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <p className="mt-4 text-xs text-white/30">
        CSV esperado: colunas <code>cliente, produto, valor, recorrente, mensal, data</code> (separador , ou ;).
      </p>
    </div>
  );
}
