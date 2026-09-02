import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dices, ArrowRight, Loader2 } from 'lucide-react';
import { NICHES } from '../../lib/niches';
import { loadBrCities, loadCountries, worldCountries, type BrCity, type Country } from '../../lib/places';
import { runProspect, type ProspectResponse } from '../../lib/api';
import type { ProspectSource } from '../../lib/types';
import { Card, PageHeader } from '../../components/admin/ui';
import SlotReel, { type SlotReelHandle } from '../../components/admin/SlotReel';
import SourceToggle from '../../components/admin/SourceToggle';

const nicheLabels = NICHES.map((n) => n.label);
type Scope = 'brasil' | 'mundo';
type Phase = 'idle' | 'spinning' | 'prospecting' | 'done' | 'error';

export default function Roleta() {
  const nicheReel = useRef<SlotReelHandle>(null);
  const cityReel = useRef<SlotReelHandle>(null);

  const [scope, setScope] = useState<Scope>('brasil');
  const [brCities, setBrCities] = useState<BrCity[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [source, setSource] = useState<ProspectSource>('apify');
  const [drawn, setDrawn] = useState<{ niche: string; place: string } | null>(null);
  const [result, setResult] = useState<ProspectResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    loadBrCities().then(setBrCities);
  }, []);
  useEffect(() => {
    if (scope === 'mundo' && !countries.length) loadCountries().then(setCountries);
  }, [scope, countries.length]);

  const worldPlaces = worldCountries(countries).filter((c) => c.cap);
  const cityLabels =
    scope === 'brasil'
      ? brCities.map((c) => `${c.n} · ${c.uf}`)
      : worldPlaces.map((c) => `${c.cap} · ${c.n}`);

  const ready = nicheLabels.length > 0 && cityLabels.length > 0;
  const busy = phase === 'spinning' || phase === 'prospecting';

  const spin = async () => {
    if (!ready) return;
    setPhase('spinning');
    setResult(null);
    setErr(null);

    const ni = Math.floor(Math.random() * NICHES.length);
    const ci = Math.floor(Math.random() * cityLabels.length);

    await Promise.all([
      nicheReel.current?.spinTo(ni),
      new Promise((r) => setTimeout(r, 450)).then(() => cityReel.current?.spinTo(ci)),
    ]);

    const niche = NICHES[ni];
    let city: string, placeLabel: string;
    let uf: string | undefined;
    let country = 'Brasil';
    let countryCode = 'BR';
    if (scope === 'brasil') {
      const c = brCities[ci];
      city = c.n; uf = c.uf; placeLabel = `${c.n} · ${c.uf}`;
    } else {
      const c = worldPlaces[ci];
      city = c.cap!; country = c.n; countryCode = c.cc; placeLabel = `${c.cap} · ${c.n}`;
    }
    setDrawn({ niche: niche.label, place: placeLabel });

    setPhase('prospecting');
    try {
      const res = await runProspect({
        mode: 'roleta',
        source,
        niche: niche.slug,
        city,
        uf,
        country,
        countryCode,
        maxResults: source === 'apify' ? 60 : 120,
        listName: `Roleta · ${niche.label} · ${city}`,
      });
      setResult(res);
      setPhase('done');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Falha na prospecção.');
      setPhase('error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Roleta"
        subtitle="Gira: sorteia um nicho e uma cidade e já dispara a prospecção."
      />

      <Card className="mx-auto max-w-2xl p-8">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
            {(['brasil', 'mundo'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                disabled={busy}
                className={`rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  scope === s ? 'bg-[#fe0000] text-white' : 'text-white/45 hover:text-white'
                }`}
              >
                {s === 'brasil' ? '🇧🇷 Brasil' : '🌎 Mundo'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-white/40">Nicho</p>
            <SlotReel ref={nicheReel} items={nicheLabels} />
          </div>
          <div>
            <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-white/40">
              {scope === 'brasil' ? 'Cidade' : 'Cidade · País'}
            </p>
            {ready ? (
              <SlotReel ref={cityReel} items={cityLabels} />
            ) : (
              <div className="grid h-[216px] place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-xs text-white/40">
                carregando cidades…
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <SourceToggle value={source} onChange={setSource} disabled={busy} />

          <button
            onClick={spin}
            disabled={busy || !ready}
            className="group relative mt-2 flex items-center gap-3 overflow-hidden rounded-full bg-[#fe0000] px-12 py-5 text-sm font-bold uppercase tracking-widest text-white disabled:opacity-60"
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Dices size={18} />}
            {phase === 'spinning' && 'Girando...'}
            {phase === 'prospecting' && 'Prospectando...'}
            {(phase === 'idle' || phase === 'done' || phase === 'error') && 'Girar a Roleta'}
          </button>
          {scope === 'brasil' && (
            <p className="text-[11px] text-white/30">{brCities.length.toLocaleString('pt-BR')} cidades</p>
          )}
        </div>

        {drawn && (
          <p className="mt-6 text-center text-sm text-white/60">
            Sorteado: <span className="font-bold text-white">{drawn.niche}</span> em{' '}
            <span className="font-bold text-white">{drawn.place}</span>
          </p>
        )}

        {phase === 'error' && (
          <p className="mt-4 rounded-xl border border-[#fe0000]/30 bg-[#fe0000]/10 px-4 py-3 text-center text-xs text-[#ff5a5a]">
            {err}
          </p>
        )}

        {phase === 'done' && result && (
          <div className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-5 text-center">
            <p className="text-sm text-white/70">
              <span className="font-bold text-white">{result.stats.new}</span> novas ·{' '}
              <span className="font-bold text-[#fe0000]">{result.stats.leads}</span> sem site ·{' '}
              {result.stats.new - result.stats.leads} com site · {result.stats.duplicates} já conhecidas
            </p>
            <Link
              to={`/admin/listas/${result.list_id}`}
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#fe0000]"
            >
              Qualificar leads <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
