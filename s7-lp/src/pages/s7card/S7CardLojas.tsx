import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { S7CardStore } from '../../lib/s7card';
import { brl, fullDate } from '../../lib/format';
import { Card, PageHeader, Btn, Field, inputClass, Badge } from '../../components/admin/ui';

const empty = { name: '', category: '', address: '', city: '', uf: '', contact_name: '', contact_phone: '', sold_value: '', sold_at: new Date().toISOString().slice(0, 10) };

export default function S7CardLojas() {
  const [stores, setStores] = useState<S7CardStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('s7card_stores').select('*').order('created_at', { ascending: false });
    setStores((data as S7CardStore[]) ?? []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('s7card_stores').insert({
      name: form.name,
      category: form.category || null,
      address: form.address || null,
      city: form.city || null,
      uf: form.uf || null,
      contact_name: form.contact_name || null,
      contact_phone: form.contact_phone || null,
      sold_value: Number(form.sold_value) || 0,
      sold_at: form.sold_at,
    });
    setSaving(false);
    if (!error) {
      setForm(empty);
      setShowForm(false);
      load();
    }
  };

  return (
    <div>
      <PageHeader
        title="Lojas"
        subtitle="Clientes que compraram a placa S7 Card."
        actions={
          <Btn onClick={() => setShowForm((s) => !s)}>
            <Plus size={14} /> Nova loja
          </Btn>
        }
      />

      {showForm && (
        <Card className="p-6 mb-6">
          <form onSubmit={add} className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da loja">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Categoria">
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} placeholder="Ex: Restaurante" />
            </Field>
            <Field label="Endereço">
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} />
            </Field>
            <div className="grid grid-cols-[1fr_90px] gap-3">
              <Field label="Cidade">
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
              </Field>
              <Field label="UF">
                <input value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })} maxLength={2} className={inputClass} />
              </Field>
            </div>
            <Field label="Contato">
              <input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Telefone">
              <input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Valor da venda (R$)">
              <input type="number" step="0.01" value={form.sold_value} onChange={(e) => setForm({ ...form, sold_value: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Data da venda">
              <input type="date" value={form.sold_at} onChange={(e) => setForm({ ...form, sold_at: e.target.value })} className={inputClass} />
            </Field>
            <Btn type="submit" disabled={saving} className="sm:col-span-2 self-start">
              {saving ? 'Salvando...' : 'Cadastrar loja'}
            </Btn>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-white/40">Carregando…</p>
      ) : stores.length === 0 ? (
        <Card className="p-10 text-center text-sm text-white/40">Nenhuma loja cadastrada ainda.</Card>
      ) : (
        <div className="grid gap-3">
          {stores.map((s) => (
            <Link key={s.id} to={`/s7card/lojas/${s.id}`}>
              <Card className="flex items-center gap-4 p-5 hover:border-[#fe0000]/40 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{s.name}</span>
                    <Badge tone={s.status === 'ativa' ? 'green' : 'default'}>{s.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-white/40">
                    {[s.category, s.city && s.uf ? `${s.city}/${s.uf}` : s.city].filter(Boolean).join(' · ')}
                    {' · '}vendida em {fullDate(s.sold_at)} · {brl(s.sold_value)}
                  </p>
                </div>
                <ChevronRight className="text-white/30" size={18} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
