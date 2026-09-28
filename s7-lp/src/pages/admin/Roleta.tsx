import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dices, ArrowRight, Loader2, Copy, Check, Upload, Radar } from 'lucide-react';
import { NICHES, type Niche } from '../../lib/niches';
import { loadBrCities, loadCountries, worldCountries, UFS, type BrCity, type Country } from '../../lib/places';
import { runProspect, type ProspectResponse } from '../../lib/api';
import { buildImportPrompt } from '../../lib/prospectPrompt';
import { parseImportFile, type ImportedBiz } from '../../lib/importParse';
import { Card, PageHeader, Btn, Field, inputClass } from '../../components/admin/ui';
import SlotReel, { type SlotReelHandle } from '../../components/admin/SlotReel';

const nicheLabels = NICHES.map((n) => n.label);
type Scope = 'brasil' | 'mundo';
type SortMode = 'ambos' | 'so_nicho' | 'so_cidade';
type Phase = 'idle' | 'spinning' | 'choosing' | 'running' | 'done' | 'error';
type Path = 'auto' | 'import' | null;

type Drawn = { niche: Niche; city: string; uf?: string; country: string; countryCode: string; place: string };

export default function Roleta() {
  const nicheReel = useRef<SlotReelHandle>(null);
  const cityReel = useRef<SlotReelHandle>(null);

  const [scope, setScope] = useState<Scope>('brasil');
  const [sortMode, setSortMode] = useState<SortMode>('ambos');
  const [ufFilter, setUfFilter] = useState(''); // '' = todos os estados (só vale pra Brasil)
  const [manualNicheSlug, setManualNicheSlug] = useState(NICHES[0].slug);
  const [manualCityIdx, setManualCityIdx] = useState(0);

  const [brCities, setBrCities] = useState<BrCity[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [path, setPath] = useState<Path>(null);
  const [drawn, setDrawn] = useState<Drawn | null>(null);
  const [result, setResult] = useState<ProspectResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ImportedBiz[] | null>(null);
  const [parseErr, setParseErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBrCities().then(setBrCities);
  }, []);
  useEffect(() => {
    if (scope === 'mundo' && !countries.length) loadCountries().then(setCountries);
  }, [scope, countries.length]);

  const worldPlaces = useMemo(() => worldCountries(countries).filter((c) => c.cap), [countries]);
  const brCitiesFiltered = useMemo(
    () => (ufFilter ? brCities.filter((c) => c.uf === ufFilter) : brCities),
    [brCities, ufFilter],
  );
  const cityPoolSize = scope === 'brasil' ? brCitiesFiltered.length : worldPlaces.length;
  const cityLabels =
    scope === 'brasil'
      ? brCitiesFiltered.map((c) => `${c.n} · ${c.uf}`)
      : worldPlaces.map((c) => `${c.cap} · ${c.n}`);

  // reset o índice manual quando o universo de cidades muda (troca de UF/escopo)
  useEffect(() => {
    setManualCityIdx(0);
  }, [scope, ufFilter, worldPlaces.length]);

  const ready = nicheLabels.length > 0 && cityLabels.length > 0;
  const busy = phase === 'spinning' || phase === 'running';

  const placeAt = (idx: number) => {
    if (scope === 'brasil') {
      const c = brCitiesFiltered[idx];
      return { city: c.n, uf: c.uf as string | undefined, country: 'Brasil', countryCode: 'BR', place: `${c.n} · ${c.uf}` };
    }
    const c = worldPlaces[idx];
    return { city: c.cap!, uf: undefined, country: c.n, countryCode: c.cc, place: `${c.cap} · ${c.n}` };
  };

  const reset = () => {
    setPhase('idle');
    setPath(null);
    setDrawn(null);
    setResult(null);
    setErr(null);
    setFile(null);
    setParsed(null);
    setParseErr(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const spin = async () => {
    if (!ready) return;
    reset();
    setPhase('spinning');

    const spinNiche = sortMode !== 'so_cidade';
    const spinCity = sortMode !== 'so_nicho';

    const ni = spinNiche ? Math.floor(Math.random() * NICHES.length) : NICHES.findIndex((n) => n.slug === manualNicheSlug);
    const ci = spinCity ? Math.floor(Math.random() * cityPoolSize) : manualCityIdx;

    const spins: Promise<void>[] = [];
    if (spinNiche) spins.push(Promise.resolve(nicheReel.current?.spinTo(ni)));
    if (spinCity) spins.push(new Promise((r) => setTimeout(r, spinNiche ? 450 : 0)).then(() => cityReel.current?.spinTo(ci)));
    await Promise.all(spins);

    const niche = NICHES[ni];
    const place = placeAt(ci);
    setDrawn({ niche, ...place });
    setPhase('choosing');
  };

  const runAuto = async () => {
    if (!drawn) return;
    setPath('auto');
    setPhase('running');
    setErr(null);
    try {
      const res = await runProspect({
        mode: 'roleta',
        source: 'osm',
        niche: drawn.niche.slug,
        city: drawn.city,
        uf: drawn.uf,
        country: drawn.country,
        countryCode: drawn.countryCode,
        maxResults: 150,
        listName: `Roleta · ${drawn.niche.label} · ${drawn.city}`,
      });
      setResult(res);
      setPhase('done');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Falha na prospecção.');
      setPhase('error');
    }
  };

  const pickFile = async (f: File) => {
    setFile(f);
    setParsed(null);
    setParseErr(null);
    try {
      const rows = await parseImportFile(f);
      if (!rows.length) {
        setParseErr('Não achei nenhuma empresa válida nesse arquivo. Confira se a coluna "nome" existe.');
        return;
      }
      setParsed(rows);
    } catch {
      setParseErr('Não consegui ler esse arquivo. Use um .csv ou .xlsx.');
    }
  };

  const runImport = async () => {
    if (!drawn || !parsed?.length) return;
    setPath('import');
    setPhase('running');
    setErr(null);
    try {
      const res = await runProspect({
        mode: 'roleta',
        source: 'import',
        niche: drawn.niche.slug,
        city: drawn.city,
        uf: drawn.uf,
        country: drawn.country,
        countryCode: drawn.countryCode,
        businesses: parsed,
        maxResults: parsed.length,
        listName: `Roleta · ${drawn.niche.label} · ${drawn.city} (importado)`,
      });
      setResult(res);
      setPhase('done');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Falha ao importar.');
      setPhase('error');
    }
  };

  const copyPrompt = () => {
    if (!drawn) return;
    navigator.clipboard.writeText(buildImportPrompt(drawn.niche, drawn.city, drawn.uf, drawn.country));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Roleta"
        subtitle="Gira: sorteia nicho e/ou cidade. Depois você escolhe prospectar automático (grátis, OpenStreetMap) ou importar um arquivo com as empresas."
      />

      <Card className="mx-auto max-w-2xl p-8">
        <div className="mb-4 flex flex-wrap justify-center gap-2">
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
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
            {([
              { key: 'ambos', label: 'Nicho + cidade' },
              { key: 'so_nicho', label: 'Só o nicho' },
              { key: 'so_cidade', label: 'Só a cidade' },
            ] as const).map((m) => (
              <button
                key={m.key}
                onClick={() => setSortMode(m.key)}
                disabled={busy}
                className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  sortMode === m.key ? 'bg-[#fe0000] text-white' : 'text-white/45 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {scope === 'brasil' && sortMode !== 'so_nicho' && (
          <div className="mb-6 flex justify-center">
            <Field label="Estado (filtra a cidade sorteada)">
              <select value={ufFilter} onChange={(e) => setUfFilter(e.target.value)} disabled={busy} className={inputClass}>
                <option value="" className="bg-[#161616]">Todos os estados</option>
                {UFS.map((uf) => (
                  <option key={uf} value={uf} className="bg-[#161616]">{uf}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-white/40">Nicho</p>
            {sortMode === 'so_cidade' ? (
              <select
                value={manualNicheSlug}
                onChange={(e) => setManualNicheSlug(e.target.value)}
                disabled={busy}
                className={`${inputClass} h-[216px] text-center`}
              >
                {NICHES.map((n) => (
                  <option key={n.slug} value={n.slug} className="bg-[#161616]">{n.label}</option>
                ))}
              </select>
            ) : (
              <SlotReel ref={nicheReel} items={nicheLabels} />
            )}
          </div>
          <div>
            <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-white/40">
              {scope === 'brasil' ? 'Cidade' : 'Cidade · País'}
            </p>
            {sortMode === 'so_nicho' ? (
              cityLabels.length ? (
                <select
                  value={manualCityIdx}
                  onChange={(e) => setManualCityIdx(Number(e.target.value))}
                  disabled={busy}
                  className={`${inputClass} h-[216px] text-center`}
                >
                  {cityLabels.map((label, i) => (
                    <option key={label} value={i} className="bg-[#161616]">{label}</option>
                  ))}
                </select>
              ) : (
                <div className="grid h-[216px] place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-xs text-white/40">
                  carregando…
                </div>
              )
            ) : ready ? (
              <SlotReel ref={cityReel} items={cityLabels} />
            ) : (
              <div className="grid h-[216px] place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-xs text-white/40">
                carregando cidades…
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={spin}
            disabled={busy || !ready || (sortMode === 'so_nicho' && !cityLabels.length)}
            className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-[#fe0000] px-12 py-5 text-sm font-bold uppercase tracking-widest text-white disabled:opacity-60"
          >
            {phase === 'spinning' ? <Loader2 size={18} className="animate-spin" /> : <Dices size={18} />}
            {phase === 'spinning' ? 'Girando...' : phase === 'idle' ? 'Girar a Roleta' : 'Girar de novo'}
          </button>
          {scope === 'brasil' && sortMode !== 'so_nicho' && (
            <p className="text-[11px] text-white/30">
              {cityPoolSize.toLocaleString('pt-BR')} cidade{cityPoolSize === 1 ? '' : 's'}{ufFilter ? ` em ${ufFilter}` : ''}
            </p>
          )}
        </div>

        {drawn && (
          <p className="mt-6 text-center text-sm text-white/60">
            Sorteado: <span className="font-bold text-white">{drawn.niche.label}</span> em{' '}
            <span className="font-bold text-white">{drawn.place}</span>
          </p>
        )}

        {/* --- escolha do caminho --- */}
        {phase === 'choosing' && drawn && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <button
              onClick={runAuto}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center hover:border-[#fe0000]/40 transition-colors"
            >
              <Radar className="text-[#fe0000]" size={22} />
              <span className="text-sm font-bold">Prospectar automático</span>
              <span className="text-[11px] text-white/40">OpenStreetMap · grátis · na hora</span>
            </button>
            <button
              onClick={() => setPath('import')}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center hover:border-[#fe0000]/40 transition-colors"
            >
              <Upload className="text-[#fe0000]" size={22} />
              <span className="text-sm font-bold">Importar arquivo</span>
              <span className="text-[11px] text-white/40">Peça pro Claude buscar e suba o CSV/XLSX</span>
            </button>
          </div>
        )}

        {/* --- painel de importação --- */}
        {phase === 'choosing' && path === 'import' && drawn && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/50">
              1. Peça pro Claude gerar a lista
            </p>
            <div className="relative">
              <textarea
                readOnly
                value={buildImportPrompt(drawn.niche, drawn.city, drawn.uf, drawn.country)}
                rows={6}
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/70"
              />
              <button
                onClick={copyPrompt}
                className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-white/20"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-widest text-white/50">
              2. Suba o arquivo que ele te devolver (.csv ou .xlsx)
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv"
              onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])}
              className="block w-full text-xs text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-[#fe0000] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:text-white"
            />
            {parseErr && <p className="mt-2 text-xs text-[#ff5a5a]">{parseErr}</p>}
            {parsed && (
              <p className="mt-2 text-xs text-emerald-400">
                {parsed.length} empresas lidas de "{file?.name}" — confira e prospecte.
              </p>
            )}

            <Btn onClick={runImport} disabled={!parsed?.length} className="mt-4">
              <Upload size={14} /> Prospectar {parsed?.length ?? ''} empresas
            </Btn>
          </div>
        )}

        {phase === 'running' && (
          <p className="mt-6 text-center text-xs text-white/45">
            {path === 'auto' ? 'Buscando no OpenStreetMap…' : 'Importando e analisando os sites…'}
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
