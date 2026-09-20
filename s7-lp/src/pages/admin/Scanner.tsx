import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Radar, Loader2, ArrowRight } from 'lucide-react';
import { NICHES } from '../../lib/niches';
import { runProspect, type ProspectResponse } from '../../lib/api';
import { Card, PageHeader, Btn } from '../../components/admin/ui';
import LocationPicker from '../../components/admin/LocationPicker';
import { defaultLocation, type LocationValue } from '../../lib/places';

export default function Scanner() {
  const [loc, setLoc] = useState<LocationValue>(defaultLocation);
  const [selected, setSelected] = useState<string[]>(NICHES.slice(0, 4).map((n) => n.slug));
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ProspectResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const toggle = (slug: string) =>
    setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected.length || !loc.city.trim()) {
      setErr('Escolha ao menos um nicho e uma cidade.');
      return;
    }
    setLoading(true);
    setErr(null);
    setRes(null);
    try {
      const r = await runProspect({
        mode: 'scanner',
        source: 'osm',
        niche: selected[0],
        extraNiches: selected.slice(1),
        city: loc.city,
        uf: loc.uf || undefined,
        country: loc.country,
        countryCode: loc.countryCode,
        maxResults: 200,
        listName: `Scanner · ${loc.city} · ${selected.length} nichos`,
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
        subtitle="Varre vários nichos de uma cidade de uma vez (OpenStreetMap, grátis) e traz tudo para você qualificar."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card className="p-7">
          <form onSubmit={submit} className="flex flex-col gap-5">
            <LocationPicker value={loc} onChange={setLoc} />

            <div>
              <span className="text-xs font-medium uppercase tracking-widest text-white/50 mb-3 block">
                Nichos ({selected.length})
              </span>
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

            <Btn type="submit" disabled={loading || !selected.length} className="mt-2 self-start px-8 py-4">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Radar size={16} />}
              {loading ? 'Escaneando...' : 'Escanear'}
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
                <span className="text-white/50 text-xs">Novas empresas</span>
                <span className="font-bold text-[#fe0000]">{res.stats.new}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/50 text-xs">Sem site</span>
                <span className="font-bold text-[#fe0000]">{res.stats.leads}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/50 text-xs">Com site</span>
                <span className="font-bold">{res.stats.new - res.stats.leads}</span>
              </div>
              <Link
                to={`/admin/listas/${res.list_id}`}
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#fe0000]"
              >
                Qualificar <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
