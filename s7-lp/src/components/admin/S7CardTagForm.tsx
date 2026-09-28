import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LINK_TYPES, linkTypeInfo, type LinkType } from '../../lib/s7card';
import { buildReviewLink, extractPlaceId, isReviewLink, PLACE_ID_FINDER_URL } from '../../lib/googleReview';
import { Btn, Field, inputClass } from './ui';

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
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const info = linkTypeInfo(linkType);
  const askReviews = storeId && linkType === 'google_review' && !storeHasReviewsBaseline;
  const isGoogleReview = linkType === 'google_review';
  const [placeIdFound, setPlaceIdFound] = useState<'auto' | 'manual' | null>(null);

  /** Cola o link do Google Maps (ou o Place ID direto) e a gente monta o link de avaliação sozinho. */
  const handleReviewPaste = (raw: string) => {
    const value = raw.trim();
    if (!value) {
      setDestination('');
      setPlaceIdFound(null);
      return;
    }
    if (isReviewLink(value)) {
      setDestination(value);
      setPlaceIdFound(null);
      return;
    }
    const placeId = extractPlaceId(value);
    if (placeId) {
      setDestination(buildReviewLink(placeId));
      setPlaceIdFound(value === placeId ? 'manual' : 'auto');
      return;
    }
    setDestination(value);
    setPlaceIdFound(null);
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
    setPlaceIdFound(null);
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
      {isGoogleReview ? (
        <Field label="Link do Google Meu Negócio (ou Place ID)">
          <input
            value={destination}
            onChange={(e) => handleReviewPaste(e.target.value)}
            className={inputClass}
            placeholder="Cole o link da loja no google.com/maps"
          />
          {placeIdFound && (
            <p className="mt-1.5 text-xs text-emerald-400">Link direto de avaliação gerado automaticamente.</p>
          )}
          {!placeIdFound && destination && !isReviewLink(destination) && (
            <p className="mt-1.5 text-xs text-amber-400">
              Não achei o CID nesse link — confira se copiou direto do google.com/maps (não de outro buscador). Como
              alternativa, pegue o Place ID de graça no{' '}
              <a href={PLACE_ID_FINDER_URL} target="_blank" rel="noreferrer" className="underline">
                buscador oficial do Google
              </a>{' '}
              e cole aqui (ou cole o link "Peça avaliações" do Google Meu Negócio direto).
            </p>
          )}
        </Field>
      ) : (
        <Field label="Destino">
          <input value={destination} onChange={(e) => setDestination(e.target.value)} className={inputClass} placeholder={info.placeholder} />
        </Field>
      )}
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
