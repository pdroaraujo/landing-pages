import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Radar, Loader2, ArrowRight } from 'lucide-react';
import { NICHES } from '../../lib/niches';
import { CITIES, REGIONS } from '../../lib/cities';
import { runProspect, type ProspectResponse } from '../../lib/api';
import type { ProspectSource } from '../../lib/types';
import { Card, PageHeader, Btn, Field, inputClass } from '../../components/admin/ui';
import SourceToggle from '../../components/admin/SourceToggle';

export default function Scanner() {
  const [region, setRegion] = useState(REGIONS[0]);
  const [selected, setSelected] = useState<string[]>(NICHES.slice(0, 4).map((n) => n.slug));
  const [source, setSource] = useState<ProspectSource>('osm');
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ProspectResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const cities = CITIES.filter((c) => c.region === region);

  const toggle = (slug: string) =>
    setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected.length) return;
    setLoading(true);
    setErr(null);
    setRes(null);
    try {
      const r = await runProspect({
        mode: 'scanner',
        source,
        niche: selected[0],
        extraNiches: selected.slice(1),
        city: cities.map((c) => c.name).join(', '),
        uf: cities[0]?.uf,
        maxResults: 60,
        autoSplit: false,
        listName: `Scanner · ${region}`,
      });
      setRes(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Falha no scanner.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Scanner Local"
        subtitle="Varre vários nichos de uma região de uma vez e ranqueia as melhores oportunidades por potencial."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card className="p-7">
          <form onSubmit={submit} className="flex flex-col gap-5">
            <Field label="Região">
              <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass}>
                {REGIONS.map((r) => (
                  <option key={r} value={r} className="bg-[#161616]">
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <p className="-mt-2 text-xs text-white/35">{cities.map((c) => c.name).join(' · ')}</p>

            <div>
              <span className="text-xs font-medium uppercase tracking-widest text-white/50 mb-3 block">Nichos ({selected.length})</span>
              <div className="grid grid-cols-2 gap-2">
                {NICHES.map((n) => (
                  <button
                    key={n.slug}
                    type="button"
                    onClick={() => toggle(n.slug)}
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      selected.includes(n.slug)
                        ? 'border-[#fe0000]/50 bg-[#fe0000]/10 text-white'
                        : 'border-white/10 text-white/45 hover:text-white'
                    }`}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">Fonte</span>
              <SourceToggle value={source} onChange={setSource} disabled={loading} />
            </div>

            <Btn type="submit" disabled={loading || !selected.length} className="mt-2 self-start px-8 py-4">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Radar size={16} />}
              {loading ? 'Escaneando...' : 'Escanear região'}
            </Btn>
            {err && <p className="text-xs text-[#ff5a5a]">{err}</p>}
          </form>
        </Card>

        <Card className="p-7 h-fit">
          <h3 className="font-bold tracking-tight mb-4">Resultado</h3>
          {!res && !loading && <p className="text-xs text-white/35">Selecione nichos e escaneie.</p>}
          {loading && <p className="text-xs text-white/45">Escaneando {selected.length} nichos…</p>}
          {res && (
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/50 text-xs">Oportunidades novas</span>
                <span className="font-bold text-[#fe0000]">{res.stats.new}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/50 text-xs">Sem site (lead)</span>
                <span className="font-bold text-[#fe0000]">{res.stats.leads}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/50 text-xs">Vale upgrade</span>
                <span className="font-bold">{res.stats.upgrades}</span>
              </div>
              <Link
                to={`/admin/listas/${res.list_id}`}
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#fe0000]"
              >
                Ver ranking <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
