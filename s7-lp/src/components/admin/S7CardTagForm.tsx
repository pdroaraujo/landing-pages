import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LINK_TYPES, linkTypeInfo, type LinkType } from '../../lib/s7card';
import { Btn, Field, inputClass } from './ui';

const randomCode = () => Math.random().toString(36).slice(2, 8);

export default function S7CardTagForm({
  storeId,
  onCreated,
}: {
  storeId?: string;
  onCreated: () => void;
}) {
  const [code, setCode] = useState(randomCode());
  const [linkType, setLinkType] = useState<LinkType>('google_review');
  const [destination, setDestination] = useState('');
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const info = linkTypeInfo(linkType);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    const { error } = await supabase.from('s7card_tags').insert({
      code: code.trim(),
      link_type: linkType,
      destination: destination.trim() || info.placeholder,
      label: label || null,
      store_id: storeId ?? null,
      status: storeId ? 'instalada' : 'em_estoque',
      installed_at: storeId ? new Date().toISOString().slice(0, 10) : null,
    });
    setSaving(false);
    if (error) {
      setErr(error.message.includes('duplicate') ? 'Já existe uma placa com esse código.' : error.message);
      return;
    }
    setCode(randomCode());
    setDestination('');
    setLabel('');
    onCreated();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de placa">
          <select value={linkType} onChange={(e) => setLinkType(e.target.value as LinkType)} className={inputClass}>
            {LINK_TYPES.map((t) => (
              <option key={t.key} value={t.key} className="bg-[#161616]">{t.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Apelido (opcional)">
          <input value={label} onChange={(e) => setLabel(e.target.value)} className={inputClass} placeholder="Ex: balcão, mesa 4" />
        </Field>
      </div>
      <p className="-mt-2 text-xs text-white/35">{info.hint}</p>
      <Field label="Destino">
        <input value={destination} onChange={(e) => setDestination(e.target.value)} className={inputClass} placeholder={info.placeholder} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código (URL pública)">
          <input value={code} onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className={inputClass} />
        </Field>
        <Field label="Link que vai na placa">
          <input readOnly value={`${window.location.origin}/r/${code}`} className={`${inputClass} text-white/50`} />
        </Field>
      </div>
      {err && <p className="text-xs text-[#ff5a5a]">{err}</p>}
      <Btn type="submit" disabled={saving} className="self-start">
        {saving ? 'Salvando...' : 'Criar placa'}
      </Btn>
    </form>
  );
}
