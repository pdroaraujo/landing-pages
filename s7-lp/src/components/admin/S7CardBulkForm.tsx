import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LINK_TYPES, linkTypeInfo, type LinkType } from '../../lib/s7card';
import { Btn, Field, inputClass } from './ui';
import Select from './Select';

const randomCode = () => Math.random().toString(36).slice(2, 8);

export default function S7CardBulkForm({ onCreated }: { onCreated: () => void }) {
  const [quantity, setQuantity] = useState(10);
  const [linkType, setLinkType] = useState<LinkType>('google_review');
  const [destination, setDestination] = useState('');
  const [prefix, setPrefix] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  const info = linkTypeInfo(linkType);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setDone(null);
    const n = Math.min(Math.max(quantity, 1), 200);
    const rows = Array.from({ length: n }, (_, i) => ({
      code: `${prefix.trim() ? prefix.trim() + '-' : ''}${randomCode()}${i}`,
      link_type: linkType,
      destination: destination.trim() || info.placeholder,
      status: 'em_estoque' as const,
    }));
    const { data, error } = await supabase.from('s7card_tags').insert(rows).select('id');
    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setDone(data?.length ?? n);
    onCreated();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-xs text-white/40">
        Gera N placas em estoque de uma vez (sem loja ainda) — útil quando você imprime/programa um lote antes de
        sair vendendo. Depois é só atribuir cada uma a uma loja em "Placas".
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Quantidade">
          <input type="number" min={1} max={200} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className={inputClass} />
        </Field>
        <Field label="Tipo de placa (padrão do lote)">
          <Select
            value={linkType}
            onChange={(v) => setLinkType(v as LinkType)}
            options={LINK_TYPES.map((t) => ({ value: t.key, label: t.label }))}
          />
        </Field>
        <Field label="Prefixo do código (opcional)">
          <input value={prefix} onChange={(e) => setPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className={inputClass} placeholder="Ex: lote1" />
        </Field>
      </div>
      <Field label="Destino padrão (dá pra editar depois, placa por placa)">
        <input value={destination} onChange={(e) => setDestination(e.target.value)} className={inputClass} placeholder={info.placeholder} />
      </Field>
      {err && <p className="text-xs text-[#ff5a5a]">{err}</p>}
      {done !== null && <p className="text-xs text-emerald-400">{done} placas criadas em estoque.</p>}
      <Btn type="submit" disabled={saving} className="self-start">
        {saving ? 'Gerando...' : `Gerar ${Math.min(Math.max(quantity, 1), 200)} placas`}
      </Btn>
    </form>
  );
}
