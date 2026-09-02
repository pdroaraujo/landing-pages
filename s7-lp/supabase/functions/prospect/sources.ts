// Coleta de empresas — Apify (Google Maps) e OpenStreetMap (grátis).
import { nicheBySlug } from './niches.ts';

export type RawBiz = {
  place_id: string | null;
  name: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  uf: string | null;
  category: string | null;
  rating: number | null;
  reviews: number | null;
  lat: number | null;
  lng: number | null;
};

const UA = 'AgenciaS7-Prospect/1.0 (contato.agencias7@outlook.com)';

// ---------------- APIFY ----------------
export async function fetchApify(opts: {
  niches: string[];
  city: string;
  uf?: string;
  country?: string; // nome do país (default Brasil)
  countryCode?: string; // ISO2 minúsculo
  maxResults: number;
}): Promise<RawBiz[]> {
  const token = Deno.env.get('APIFY_TOKEN');
  if (!token) throw new Error('APIFY_TOKEN não configurado.');
  const actor = (Deno.env.get('APIFY_ACTOR') ?? 'compass/google-maps-extractor').replace('/', '~');
  const isBR = !opts.countryCode || opts.countryCode.toLowerCase() === 'br';
  const region = [opts.city, opts.uf, isBR ? '' : opts.country].filter(Boolean).join(' ');

  const termsPerNiche = opts.niches.length > 2 ? 1 : opts.niches.length > 1 ? 2 : 3;
  let searchStringsArray: string[] = [];
  for (const slug of opts.niches) {
    const n = nicheBySlug(slug);
    for (const term of n.apifyTerms.slice(0, termsPerNiche)) {
      searchStringsArray.push(`${term} em ${region}`);
    }
  }
  // no máx. 3 runs paralelos (limite de memória total do plano free da Apify)
  searchStringsArray = searchStringsArray.slice(0, 3);

  // Dispara os runs Apify EM PARALELO (1 termo por run) — rodam ao mesmo tempo
  // na infra da Apify, então o tempo total ≈ o de um run só, não a soma.
  const perSearch = Math.min(120, Math.max(8, Math.ceil(opts.maxResults / searchStringsArray.length)));
  const DONE = ['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'];

  const startRun = async (term: string) => {
    const input: Record<string, unknown> = {
      searchStringsArray: [term],
      language: isBR ? 'pt-BR' : 'en',
      maxCrawledPlacesPerSearch: perSearch,
      skipClosedPlaces: true,
    };
    if (opts.countryCode) input.countryCode = opts.countryCode.toLowerCase();
    const r = await fetch(
      `https://api.apify.com/v2/acts/${actor}/runs?token=${token}&timeout=170`,
      { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) },
    );
    if (!r.ok) throw new Error(`Apify ${r.status}: ${(await r.text()).slice(0, 160)}`);
    const j = (await r.json()) as { data: { id: string; defaultDatasetId: string } };
    return { id: j.data.id, dataset: j.data.defaultDatasetId };
  };

  const runs = await Promise.all(searchStringsArray.map(startRun));

  // poll paralelo até todos terminarem ou o orçamento acabar
  const BUDGET_MS = 88_000;
  const t0 = Date.now();
  const pending = new Set(runs.map((r) => r.id));
  while (pending.size && Date.now() - t0 < BUDGET_MS) {
    await new Promise((res) => setTimeout(res, 4000));
    await Promise.all(
      [...pending].map(async (id) => {
        try {
          const st = await fetch(`https://api.apify.com/v2/actor-runs/${id}?token=${token}`);
          const status = ((await st.json()) as { data: { status: string } }).data.status;
          if (DONE.includes(status)) pending.delete(id);
        } catch { /* tenta de novo */ }
      }),
    );
  }
  // aborta os que sobraram (não gasta crédito à toa) e pega o parcial
  for (const id of pending) {
    fetch(`https://api.apify.com/v2/actor-runs/${id}/abort?token=${token}`, { method: 'POST' }).catch(() => {});
  }

  const perDataset = Math.ceil((opts.maxResults * 2) / runs.length);
  const batches = await Promise.all(
    runs.map(async (r) => {
      try {
        const res = await fetch(
          `https://api.apify.com/v2/datasets/${r.dataset}/items?token=${token}&clean=true&limit=${perDataset}`,
        );
        return res.ok ? ((await res.json()) as Record<string, unknown>[]) : [];
      } catch {
        return [];
      }
    }),
  );
  const items = batches.flat();

  return items.map((it) => ({
    place_id: (it.placeId as string) ?? (it.fid as string) ?? null,
    name: (it.title as string) ?? (it.name as string) ?? 'Sem nome',
    phone: (it.phone as string) ?? (it.phoneUnformatted as string) ?? null,
    website: cleanUrl(it.website as string | undefined),
    address: (it.address as string) ?? (it.street as string) ?? null,
    city: (it.city as string) ?? opts.city,
    uf: (it.state as string) ?? opts.uf ?? null,
    category: (it.categoryName as string) ?? ((it.categories as string[]) ?? [])[0] ?? null,
    rating: typeof it.totalScore === 'number' ? (it.totalScore as number) : null,
    reviews: typeof it.reviewsCount === 'number' ? (it.reviewsCount as number) : null,
    lat: (it.location as { lat?: number })?.lat ?? null,
    lng: (it.location as { lng?: number })?.lng ?? null,
  }));
}

// ---------------- OPENSTREETMAP ----------------
export async function fetchOSM(opts: {
  niches: string[];
  city: string;
  uf?: string;
  country?: string;
  countryCode?: string;
  maxResults: number;
}): Promise<RawBiz[]> {
  const isBR = !opts.countryCode || opts.countryCode.toLowerCase() === 'br';
  const countryName = isBR ? 'Brasil' : opts.country || '';
  // 1. geocode da cidade -> osm area id
  const q = encodeURIComponent([opts.city, isBR ? opts.uf : '', countryName].filter(Boolean).join(', '));
  const geo = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
    headers: { 'User-Agent': UA },
  });
  const gj = (await geo.json()) as { osm_id: number; osm_type: string }[];
  if (!gj.length) throw new Error(`Cidade não encontrada no OSM: ${opts.city}`);
  const areaId = 3600000000 + gj[0].osm_id; // relation -> area

  // 2. monta filtros de tags (só os que costumam ter empresa com site — limita a 6 p/ não estourar o Overpass)
  const tags = [...new Set(opts.niches.flatMap((slug) => nicheBySlug(slug).osmTags))].slice(0, 6);
  const tagFilters = tags
    .map((t) => {
      const [k, v] = t.split('=');
      return `nwr["${k}"="${v}"](area.a);`;
    })
    .join('\n');

  const cap = Math.min(opts.maxResults * 2, 250);
  const query = `[out:json][timeout:25];area(${areaId})->.a;(${tagFilters});out center tags ${cap};`;

  // Overpass público às vezes 429/504 — tenta 2 mirrors
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];
  let res: Response | null = null;
  for (const ep of endpoints) {
    try {
      const r = await fetch(ep, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
        body: 'data=' + encodeURIComponent(query),
      });
      if (r.ok) { res = r; break; }
    } catch { /* tenta o próximo */ }
  }
  if (!res) throw new Error('Overpass indisponível — tente de novo ou use a fonte Google (Apify).');
  const data = (await res.json()) as { elements: { id: number; type: string; tags?: Record<string, string>; lat?: number; lon?: number; center?: { lat: number; lon: number } }[] };

  const seen = new Set<string>();
  const out: RawBiz[] = [];
  for (const el of data.elements) {
    const t = el.tags ?? {};
    const name = t.name || t['name:pt'] || t.brand;
    if (!name) continue;
    if (seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push({
      place_id: `osm:${el.type}/${el.id}`,
      name,
      phone: t.phone || t['contact:phone'] || t['contact:mobile'] || null,
      website: cleanUrl(t.website || t['contact:website'] || t.url),
      address: [t['addr:street'], t['addr:housenumber'], t['addr:suburb']].filter(Boolean).join(', ') || null,
      city: t['addr:city'] || opts.city,
      uf: opts.uf ?? null,
      category: Object.entries(t).find(([k]) => ['shop', 'amenity', 'office', 'craft', 'tourism', 'leisure', 'healthcare'].includes(k))?.[1] ?? null,
      rating: null,
      reviews: null,
      lat: el.lat ?? el.center?.lat ?? null,
      lng: el.lon ?? el.center?.lon ?? null,
    });
    if (out.length >= opts.maxResults) break;
  }
  return out;
}

function cleanUrl(u?: string | null): string | null {
  if (!u) return null;
  let s = u.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  try {
    return new URL(s).toString();
  } catch {
    return null;
  }
}
