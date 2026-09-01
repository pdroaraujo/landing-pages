import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dices, ArrowRight, Loader2 } from 'lucide-react';
import { NICHES } from '../../lib/niches';
import { CITIES } from '../../lib/cities';
import { runProspect, type ProspectResponse } from '../../lib/api';
import type { ProspectSource } from '../../lib/types';
import { Card, PageHeader } from '../../components/admin/ui';
import SlotReel, { type SlotReelHandle } from '../../components/admin/SlotReel';
import SourceToggle from '../../components/admin/SourceToggle';

const nicheLabels = NICHES.map((n) => n.label);
const cityLabels = CITIES.map((c) => `${c.name} · ${c.uf}`);

type Phase = 'idle' | 'spinning' | 'prospecting' | 'done' | 'error';

export default function Roleta() {
  const nicheReel = useRef<SlotReelHandle>(null);
  const cityReel = useRef<SlotReelHandle>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [source, setSource] = useState<ProspectSource>('osm');
  const [autoSplit, setAutoSplit] = useState(true);
  const [drawn, setDrawn] = useState<{ niche: string; city: string } | null>(null);
  const [result, setResult] = useState<ProspectResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const spin = async () => {
    setPhase('spinning');
    setResult(null);
    setErr(null);
    const ni = Math.floor(Math.random() * NICHES.length);
    const ci = Math.floor(Math.random() * CITIES.length);

    await Promise.all([
      nicheReel.current?.spinTo(ni),
      new Promise((r) => setTimeout(r, 450)).then(() => cityReel.current?.spinTo(ci)),
    ]);

    const niche = NICHES[ni];
    const city = CITIES[ci];
    setDrawn({ niche: niche.label, city: `${city.name} · ${city.uf}` });

    setPhase('prospecting');
    try {
      const res = await runProspect({
        mode: 'roleta',
        source,
        niche: niche.slug,
        city: city.name,
        uf: city.uf,
        autoSplit,
        maxResults: 120,
        listName: `Roleta · ${niche.label} · ${city.name}`,
      });
      setResult(res);
      setPhase('done');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Falha na prospecção.');
      setPhase('error');
    }
  };

  const busy = phase === 'spinning' || phase === 'prospecting';

  return (
    <div>
      <PageHeader
        title="Roleta"
        subtitle="Gira a roleta: ela sorteia um nicho e uma cidade e dispara a prospecção automaticamente."
      />

      <Card className="mx-auto max-w-2xl p-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-white/40">Nicho</p>
            <SlotReel ref={nicheReel} items={nicheLabels} />
          </div>
          <div>
            <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-white/40">Cidade</p>
            <SlotReel ref={cityReel} items={cityLabels} />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <SourceToggle value={source} onChange={setSource} disabled={busy} />
          <label className="flex items-center gap-2 text-xs text-white/50">
            <input
              type="checkbox"
              checked={autoSplit}
              onChange={(e) => setAutoSplit(e.target.checked)}
              disabled={busy}
              className="accent-[#fe0000]"
            />
            Dividir automaticamente entre a equipe
          </label>

          <button
            onClick={spin}
            disabled={busy}
            className="group relative mt-2 flex items-center gap-3 overflow-hidden rounded-full bg-[#fe0000] px-12 py-5 text-sm font-bold uppercase tracking-widest text-white disabled:opacity-60"
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Dices size={18} />}
            {phase === 'spinning' && 'Girando...'}
            {phase === 'prospecting' && 'Prospectando...'}
            {(phase === 'idle' || phase === 'done' || phase === 'error') && 'Girar a Roleta'}
          </button>
        </div>

        {drawn && (
          <p className="mt-6 text-center text-sm text-white/60">
            Sorteado: <span className="font-bold text-white">{drawn.niche}</span> em{' '}
            <span className="font-bold text-white">{drawn.city}</span>
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
              <span className="font-bold text-white">{result.stats.new}</span> novas empresas ·{' '}
              <span className="font-bold text-[#fe0000]">{result.stats.leads}</span> leads sem site ·{' '}
              {result.stats.duplicates} já conhecidas
              {!!result.stats.analyzing && ` · analisando ${result.stats.analyzing} sites…`}
            </p>
            <Link
              to={`/admin/listas/${result.list_id}`}
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#fe0000]"
            >
              Abrir lista <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
