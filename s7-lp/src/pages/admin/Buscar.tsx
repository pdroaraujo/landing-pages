import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { NICHES } from '../../lib/niches';
import { runProspect, type ProspectResponse } from '../../lib/api';
import { Card, PageHeader, Btn, Field, inputClass } from '../../components/admin/ui';
import LocationPicker from '../../components/admin/LocationPicker';
import { defaultLocation, type LocationValue } from '../../lib/places';

export default function Buscar() {
  const [niche, setNiche] = useState(NICHES[0].slug);
  const [loc, setLoc] = useState<LocationValue>(defaultLocation);
  const [maxResults, setMaxResults] = useState(100);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ProspectResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loc.city.trim()) {
      setErr('Informe a cidade.');
      return;
    }
    setLoading(true);
    setErr(null);
    setRes(null);
    try {
      const r = await runProspect({
        mode: 'buscar',
        source: 'osm',
        niche,
        city: loc.city,
        uf: loc.uf || undefined,
        country: loc.country,
        countryCode: loc.countryCode,
        maxResults,
        listName: `${NICHES.find((n) => n.slug === niche)?.label} · ${loc.city}`,
      });
      setRes(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Falha na prospecção.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Encontrar Clientes"
        subtitle="Escolha nicho e cidade. Buscamos as empresas no OpenStreetMap (grátis), verificamos site e você qualifica os leads depois."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card className="p-7">
          <form onSubmit={submit} className="flex flex-col gap-5">
            <Field label="Nicho">
              <select value={niche} onChange={(e) => setNiche(e.target.value)} className={inputClass}>
                {NICHES.map((n) => (
                  <option key={n.slug} value={n.slug} className="bg-[#161616]">
                    {n.label}
                  </option>
                ))}
              </select>
            </Field>

            <LocationPicker value={loc} onChange={setLoc} />

            <Field label={`Máx. de empresas: ${maxResults}`}>
              <input
                type="range"
                min={20}
                max={300}
                step={10}
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="w-full accent-[#fe0000]"
              />
            </Field>

            <p className="-mt-2 text-xs text-white/35">
              Sem cobertura no OpenStreetMap pra essa cidade/nicho? Use a{' '}
              <Link to="/admin/prospeccao/roleta" className="text-[#fe0000]">Roleta → Importar arquivo</Link>{' '}
              pra trazer os dados de outra fonte.
            </p>

            <Btn type="submit" disabled={loading} className="mt-2 self-start px-8 py-4">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? 'Prospectando...' : 'Prospectar'}
            </Btn>

            {err && <p className="text-xs text-[#ff5a5a]">{err}</p>}
          </form>
        </Card>

        <Card className="p-7 h-fit">
          <h3 className="font-bold tracking-tight mb-4">Resultado</h3>
          {!res && !loading && <p className="text-xs text-white/35">Preencha e clique em Prospectar.</p>}
          {loading && (
            <p className="text-xs text-white/45">
              Buscando empresas… Sites com "análise pendente" você completa depois com um clique na lista.
            </p>
          )}
          {res && (
            <div className="flex flex-col gap-2 text-sm">
              <Row label="Encontradas" value={res.stats.found} />
              <Row label="Novas" value={res.stats.new} accent />
              <Row label="Sem site" value={res.stats.leads} accent />
              <Row label="Com site" value={res.stats.new - res.stats.leads} />
              <Row label="Já conhecidas (ignoradas)" value={res.stats.duplicates} />
              <Link
                to={`/admin/listas/${res.list_id}`}
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#fe0000]"
              >
                Qualificar leads <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-white/50 text-xs">{label}</span>
      <span className={`font-bold ${accent ? 'text-[#fe0000]' : ''}`}>{value}</span>
    </div>
  );
}
