import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dices, ArrowRight, Loader2, Copy, Check, Upload } from 'lucide-react';
import { NICHES, type Niche } from '../../lib/niches';
import { loadBrCities, loadCountries, worldCountries, UF_OPTIONS, EMPTY_PLACE, type BrCity, type Country, type Place } from '../../lib/places';
import NichePicker, { TypeChips } from '../../components/admin/NichePicker';
import PlacePicker from '../../components/admin/PlacePicker';
import { runProspect, type ProspectResponse } from '../../lib/api';
import { buildImportPrompt } from '../../lib/prospectPrompt';
import { parseImportFile, type ImportedBiz } from '../../lib/importParse';
import { Card, PageHeader, Btn, Field } from '../../components/admin/ui';
import Select from '../../components/admin/Select';
import SlotReel, { type SlotReelHandle } from '../../components/admin/SlotReel';

const randInt = (n: number) => Math.floor(Math.random() * n);
const nicheLabels = NICHES.map((n) => n.label);
type Scope = 'brasil' | 'mundo';
type SortMode = 'ambos' | 'so_nicho' | 'so_cidade';
type Phase = 'idle' | 'spinning' | 'ready' | 'running' | 'done' | 'error';

type Via = 'roleta' | 'escolher';
type Drawn = { niche: Niche; type: string; city: string; uf?: string; country: string; countryCode: string; place: string };

export default function Roleta() {
  const nicheReel = useRef<SlotReelHandle>(null);
  const cityReel = useRef<SlotReelHandle>(null);

  const [scope, setScope] = useState<Scope>('brasil');
  const [sortMode, setSortMode] = useState<SortMode>('ambos');
  const [ufFilter, setUfFilter] = useState(''); // '' = todos os estados (só vale pra Brasil)
  const [manualNicheSlug, setManualNicheSlug] = useState<string | null>(null);
  const [manualType, setManualType] = useState('');
  const [fixedPlace, setFixedPlace] = useState<Place>(EMPTY_PLACE);
  const [via, setVia] = useState<Via>('roleta');
  const [pickSlug, setPickSlug] = useState<string | null>(null);
  const [pickType, setPickType] = useState('');
  const [pickPlace, setPickPlace] = useState<Place>(EMPTY_PLACE);

  const [brCities, setBrCities] = useState<BrCity[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
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

  const ready =
    sortMode === 'so_nicho' ? !!fixedPlace.city : sortMode === 'so_cidade' ? !!manualNicheSlug && cityLabels.length > 0 : cityLabels.length > 0;
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

    const ni = spinNiche ? randInt(NICHES.length) : NICHES.findIndex((n) => n.slug === manualNicheSlug);
    const ci = spinCity ? randInt(cityPoolSize) : 0;

    const spins: Promise<void>[] = [];
    if (spinNiche) spins.push(Promise.resolve(nicheReel.current?.spinTo(ni)));
    if (spinCity) spins.push(new Promise((r) => setTimeout(r, spinNiche ? 450 : 0)).then(() => cityReel.current?.spinTo(ci)));
    await Promise.all(spins);

    const niche = NICHES[ni];
    const place = spinCity
      ? placeAt(ci)
      : {
          city: fixedPlace.city,
          uf: fixedPlace.uf || undefined,
          country: fixedPlace.country,
          countryCode: fixedPlace.countryCode,
          place: [fixedPlace.city, fixedPlace.uf || fixedPlace.country].join(' · '),
        };
    setDrawn({ niche, type: spinNiche ? '' : manualType, ...place });
    setPhase('ready');
  };

  const confirmPick = () => {
    const niche = NICHES.find((n) => n.slug === pickSlug);
    if (!niche || !pickPlace.city) return;
    reset();
    setDrawn({
      niche,
      type: pickType,
      city: pickPlace.city,
      uf: pickPlace.uf || undefined,
      country: pickPlace.country,
      countryCode: pickPlace.countryCode,
      place: [pickPlace.city, pickPlace.uf || pickPlace.country].join(' · '),
    });
    setPhase('ready');
  };

  const switchVia = (v: Via) => {
    reset();
    setVia(v);
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
    setPhase('running');
    setErr(null);
    try {
      const res = await runProspect({
        mode: via === 'roleta' ? 'roleta' : 'buscar',
        niche: drawn.niche.slug,
        city: drawn.city,
        uf: drawn.uf,
        country: drawn.country,
        countryCode: drawn.countryCode,
        businesses: parsed,
        maxResults: parsed.length,
        listName: `${via === 'roleta' ? 'Roleta' : 'Prospecção'} · ${drawn.type || drawn.niche.label} · ${drawn.city}`,
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
    navigator.clipboard.writeText(buildImportPrompt(drawn.niche, drawn.city, drawn.uf, drawn.country, drawn.type));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Prospecção"
        subtitle="Sorteie nicho e cidade na roleta ou escolha tudo na mão. Depois peça a lista pro Claude e suba o arquivo."
      />

      <Card className="mx-auto max-w-3xl p-8">
        <div className="mb-6 flex justify-center">
          <div className="tabs-track inline-flex max-w-full overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-1">
            {([
              { key: 'roleta', label: 'Roleta' },
              { key: 'escolher', label: 'Escolher' },
            ] as const).map((v) => (
              <button
                key={v.key}
                onClick={() => switchVia(v.key)}
                disabled={busy}
                className={`rounded-full px-6 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  via === v.key ? 'bg-[#fe0000] text-white' : 'text-white/45 hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {via === 'escolher' && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/40">1. Categoria e tipo</p>
              <NichePicker
                nicheSlug={pickSlug}
                type={pickType}
                onChange={(slug, t) => {
                  setPickSlug(slug);
                  setPickType(t);
                }}
                disabled={busy}
              />
            </div>
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/40">2. Localização</p>
              <PlacePicker value={pickPlace} onChange={setPickPlace} disabled={busy} />
            </div>
            <Btn onClick={confirmPick} disabled={!pickSlug || !pickPlace.city || busy} className="self-start">
              Continuar <ArrowRight size={14} />
            </Btn>
          </div>
        )}

        {via === 'roleta' && (<>
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {sortMode !== 'so_nicho' && (
          <div className="tabs-track inline-flex max-w-full overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-1">
            {(['brasil', 'mundo'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                disabled={busy}
                className={`rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  scope === s ? 'bg-[#fe0000] text-white' : 'text-white/45 hover:text-white'
                }`}
              >
                {s === 'brasil' ? 'Brasil' : 'Mundo'}
              </button>
            ))}
          </div>
          )}
          <div className="tabs-track inline-flex max-w-full overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-1">
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
          <div className="mx-auto mb-6 max-w-xs">
            <Field label="Estado (filtra a cidade sorteada)">
              <Select
                value={ufFilter}
                onChange={setUfFilter}
                options={[{ value: '', label: 'Todos os estados' }, ...UF_OPTIONS]}
                disabled={busy}
                searchable
              />
            </Field>
          </div>
        )}

        {sortMode === 'so_cidade' && (
          <div className="mb-6">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/40">Nicho fixo (categoria e tipo)</p>
            <NichePicker
              nicheSlug={manualNicheSlug}
              type={manualType}
              onChange={(slug, t) => {
                setManualNicheSlug(slug);
                setManualType(t);
              }}
              disabled={busy}
            />
          </div>
        )}

        {sortMode === 'so_nicho' && (
          <div className="mb-6">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/40">Localização fixa</p>
            <PlacePicker value={fixedPlace} onChange={setFixedPlace} disabled={busy} />
          </div>
        )}

        <div className={sortMode === 'ambos' ? 'grid grid-cols-2 gap-4' : 'mx-auto max-w-xs'}>
          {sortMode !== 'so_cidade' && (
            <div>
              <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-white/40">Nicho</p>
              <SlotReel ref={nicheReel} items={nicheLabels} />
            </div>
          )}
          {sortMode !== 'so_nicho' && (
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
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={spin}
            disabled={busy || !ready}
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

        </>)}

        {drawn && (
          <div className="mt-6 text-center">
            <p className="text-sm text-white/60">
              {via === 'roleta' ? 'Sorteado' : 'Escolhido'}:{' '}
              <span className="font-bold text-white">{drawn.type ? `${drawn.type} (${drawn.niche.label})` : drawn.niche.label}</span> em{' '}
              <span className="font-bold text-white">{drawn.place}</span>
            </p>
            {via === 'roleta' && phase === 'ready' && drawn.niche.slug !== 'outros' && (
              <div className="mt-4 text-left">
                <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-white/40">
                  Refinar o tipo (opcional)
                </p>
                <div className="flex justify-center">
                  <TypeChips niche={drawn.niche} type={drawn.type} onChange={(t) => setDrawn({ ...drawn, type: t })} />
                </div>
              </div>
            )}
          </div>
        )}

        {(phase === 'ready' || phase === 'running' || phase === 'done' || phase === 'error') && drawn && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/50">
              1. Peça pro Claude gerar a lista
            </p>
            <div className="relative">
              <textarea
                readOnly
                value={buildImportPrompt(drawn.niche, drawn.city, drawn.uf, drawn.country, drawn.type)}
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

            <Btn onClick={runImport} disabled={!parsed?.length || busy} className="mt-4">
              <Upload size={14} /> {phase === 'running' ? 'Importando...' : `Prospectar ${parsed?.length ?? ''} empresas`}
            </Btn>
          </div>
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
