import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LINK_TYPES, linkTypeInfo, type LinkType } from '../../lib/s7card';
import { buildReviewLink, extractPlaceId, isReviewLink, PLACE_ID_FINDER_URL } from '../../lib/googleReview';
import { Btn, Field, inputClass } from './ui';
import Select from './Select';

const randomCode = () => Math.random().toString(36).slice(2, 8);

export default function S7CardTagForm({
  storeId,
  storeHasReviewsBaseline,
  onCreated,
}: {
  storeId?: string;
  /** se a loja já tem uma contagem de avaliações registrada, não pede de novo aqui */
  storeHasReviewsBaseline?: boolean;
  onCreated: () => void;
}) {
  const [code, setCode] = useState(randomCode());
  const [linkType, setLinkType] = useState<LinkType>('google_review');
  const [destination, setDestination] = useState('');
  const [label, setLabel] = useState('');
  const [reviewsBaseline, setReviewsBaseline] = useState('');
  const [soldValue, setSoldValue] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const info = linkTypeInfo(linkType);
  const askReviews = storeId && linkType === 'google_review' && !storeHasReviewsBaseline;
  const isGoogleReview = linkType === 'google_review';
  const [placeIdFound, setPlaceIdFound] = useState(false);

  /** Cola o link "Peça avaliações" do Google Meu Negócio, OU o Place ID (ChIJ...) do buscador oficial do Google. */
  const handleReviewPaste = (raw: string) => {
    const value = raw.trim();
    if (!value) {
      setDestination('');
      setPlaceIdFound(false);
      return;
    }
    if (isReviewLink(value)) {
      setDestination(value);
      setPlaceIdFound(false);
      return;
    }
    const placeId = extractPlaceId(value);
    if (placeId) {
      setDestination(buildReviewLink(placeId));
      setPlaceIdFound(true);
      return;
    }
    setDestination(value);
    setPlaceIdFound(false);
  };

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
      sold_value: Number(soldValue) || 0,
      quantity: Math.max(1, Number(quantity) || 1),
    });
    if (error) {
      setSaving(false);
      setErr(error.message.includes('duplicate') ? 'Já existe uma placa com esse código.' : error.message);
      return;
    }
    if (askReviews && reviewsBaseline && storeId) {
      const today = new Date().toISOString().slice(0, 10);
      await supabase
        .from('s7card_stores')
        .update({ reviews_baseline: Number(reviewsBaseline), reviews_baseline_at: today })
        .eq('id', storeId);
    }
    setSaving(false);
    setCode(randomCode());
    setDestination('');
    setLabel('');
    setReviewsBaseline('');
    setSoldValue('');
    setQuantity('1');
    setPlaceIdFound(false);
    onCreated();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de placa">
          <Select
            value={linkType}
            onChange={(v) => setLinkType(v as LinkType)}
            options={LINK_TYPES.map((t) => ({ value: t.key, label: t.label }))}
          />
        </Field>
        <Field label="Apelido (opcional)">
          <input value={label} onChange={(e) => setLabel(e.target.value)} className={inputClass} placeholder="Ex: balcão, mesa 4" />
        </Field>
      </div>
      <p className="-mt-2 text-xs text-white/35">{info.hint}</p>
      {isGoogleReview ? (
        <Field label="Link de avaliação (Google Meu Negócio) ou Place ID">
          <input
            value={destination}
            onChange={(e) => handleReviewPaste(e.target.value)}
            className={inputClass}
            placeholder="Cole o link de dentro de 'Peça avaliações', ou um Place ID (ChIJ...)"
          />
          {placeIdFound && (
            <p className="mt-1.5 text-xs text-emerald-400">Link direto de avaliação gerado a partir do Place ID.</p>
          )}
          {!placeIdFound && destination && !isReviewLink(destination) && (
            <p className="mt-1.5 text-xs text-amber-400">
              O link comum do google.com/maps não serve aqui — o Google só aceita o Place ID (ChIJ...) nesse link
              direto. Pegue de um dos dois jeitos, de graça: dentro do painel do Google Meu Negócio em{' '}
              <span className="text-white/70">Perfil da Empresa → Peça avaliações</span> (copia o link pronto), ou no{' '}
              <a href={PLACE_ID_FINDER_URL} target="_blank" rel="noreferrer" className="underline">
                buscador oficial de Place ID do Google
              </a>{' '}
              (copia o ChIJ... e cola aqui).
            </p>
          )}
        </Field>
      ) : (
        <Field label="Destino">
          <input value={destination} onChange={(e) => setDestination(e.target.value)} className={inputClass} placeholder={info.placeholder} />
        </Field>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Valor vendido (R$)">
          <input
            type="number"
            min={0}
            step="0.01"
            value={soldValue}
            onChange={(e) => setSoldValue(e.target.value)}
            className={inputClass}
            placeholder="Ex: 89,90 (deixe vazio se ainda não foi vendida)"
          />
        </Field>
        <Field label="Quantidade (placas com esse mesmo link)">
          <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} />
        </Field>
      </div>
      {askReviews && (
        <Field label="Avaliações no Google hoje (fica salvo pra comparar depois)">
          <input
            type="number"
            value={reviewsBaseline}
            onChange={(e) => setReviewsBaseline(e.target.value)}
            className={inputClass}
            placeholder="Ex: 12"
          />
        </Field>
      )}
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
