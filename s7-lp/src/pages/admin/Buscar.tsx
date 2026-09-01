import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { NICHES } from '../../lib/niches';
import { CITIES } from '../../lib/cities';
import { runProspect, type ProspectResponse } from '../../lib/api';
import type { ProspectSource } from '../../lib/types';
import { Card, PageHeader, Btn, Field, inputClass } from '../../components/admin/ui';
import SourceToggle from '../../components/admin/SourceToggle';

export default function Buscar() {
  const [niche, setNiche] = useState(NICHES[0].slug);
  const [city, setCity] = useState(CITIES[0].name);
  const [uf, setUf] = useState(CITIES[0].uf);
  const [source, setSource] = useState<ProspectSource>('apify');
  const [maxResults, setMaxResults] = useState(100);
  const [autoSplit, setAutoSplit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ProspectResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const pickCity = (name: string) => {
    setCity(name);
    const c = CITIES.find((x) => x.name === name);
    if (c) setUf(c.uf);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setRes(null);
    try {
      const r = await runProspect({
        mode: 'buscar',
        source,
        niche,
        city,
        uf,
        maxResults,
        autoSplit,
        listName: `${NICHES.find((n) => n.slug === niche)?.label} · ${city}`,
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
        subtitle="Escolha nicho e cidade. Buscamos no Google Maps, verificamos site e montamos a lista."
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

            <div className="grid grid-cols-[1fr_90px] gap-3">
              <Field label="Cidade">
                <input
                  list="cidades"
                  value={city}
                  onChange={(e) => pickCity(e.target.value)}
                  className={inputClass}
                  placeholder="Ex: Santos"
                />
                <datalist id="cidades">
                  {CITIES.map((c) => (
                    <option key={c.name} value={c.name} />
                  ))}
                </datalist>
              </Field>
              <Field label="UF">
                <input value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} maxLength={2} className={inputClass} />
              </Field>
            </div>

            <Field label={`Máx. de empresas: ${maxResults}`}>
              <input
                type="range"
                min={20}
                max={200}
                step={10}
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="w-full accent-[#fe0000]"
              />
            </Field>

            <div>
              <span className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">Fonte</span>
              <SourceToggle value={source} onChange={setSource} disabled={loading} />
            </div>

            <label className="flex items-center gap-2 text-xs text-white/50">
              <input type="checkbox" checked={autoSplit} onChange={(e) => setAutoSplit(e.target.checked)} className="accent-[#fe0000]" />
              Dividir a lista automaticamente entre a equipe
            </label>

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
          {loading && <p className="text-xs text-white/45">Buscando empresas e analisando sites…</p>}
          {res && (
            <div className="flex flex-col gap-2 text-sm">
              <Row label="Encontradas" value={res.stats.found} />
              <Row label="Novas" value={res.stats.new} accent />
              <Row label="Leads (sem site)" value={res.stats.leads} accent />
              <Row label="Com site — vale upgrade" value={res.stats.upgrades} />
              <Row label="Já conhecidas (ignoradas)" value={res.stats.duplicates} />
              {!!res.stats.analyzing && (
                <p className="pt-1 text-[11px] text-white/40">
                  Analisando {res.stats.analyzing} sites em segundo plano — atualize a lista em ~1 min.
                </p>
              )}
              <Link
                to={`/admin/listas/${res.list_id}`}
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#fe0000]"
              >
                Abrir lista <ArrowRight size={14} />
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
