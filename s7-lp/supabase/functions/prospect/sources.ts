// Coleta de empresas — OpenStreetMap (grátis, automático). A fonte "import"
// (arquivo gerado manualmente) é tratada direto em index.ts, sem passar por cá.
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

// fetch() do Deno não tem timeout por padrão — uma conexão que trava (comum com
// Overpass/Nominatim vistos de IPs de datacenter) segura a function até o limite
// duro da plataforma (WORKER_RESOURCE_LIMIT, ~150s) sem nunca cair no catch.
async function fetchTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(to);
  }
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
  // 1. geocode da cidade -> área do OSM. Usa o Photon (komoot) em vez do Nominatim:
  // o Nominatim bloqueia/rate-limita IPs de datacenter (ex: Supabase Edge Functions)
  // com "Access denied"; o Photon usa os mesmos dados do OSM e é liberado pra isso.
  const q = encodeURIComponent([opts.city, isBR ? opts.uf : '', countryName].filter(Boolean).join(', '));
  let geoRes: Response;
  try {
    geoRes = await fetchTimeout(`https://photon.komoot.io/api/?q=${q}&limit=5`, { headers: { 'User-Agent': UA } }, 15_000);
  } catch {
    throw new Error('Geocoder (Photon) não respondeu a tempo — tente de novo em instantes.');
  }
  if (!geoRes.ok) throw new Error(`Geocoder indisponível (${geoRes.status}) — tente de novo em instantes.`);
  let geoJson: { features: { properties: { osm_id: number; osm_type: string; osm_key?: string } }[] };
  try {
    geoJson = await geoRes.json();
  } catch {
    throw new Error('Geocoder retornou uma resposta inesperada — tente de novo em instantes.');
  }
  // prefere uma relação administrativa (limite de cidade); N (node) não serve de área
  const place =
    geoJson.features?.find((f) => f.properties.osm_type === 'R' && f.properties.osm_key !== 'military') ??
    geoJson.features?.[0];
  if (!place || place.properties.osm_type === 'N') {
    throw new Error(`Cidade não encontrada no OSM: ${opts.city}`);
  }
  const areaId =
    place.properties.osm_type === 'W'
      ? 2400000000 + place.properties.osm_id
      : 3600000000 + place.properties.osm_id; // relation -> area

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

  // Overpass público às vezes 429/504/timeout, e alguns mirrors ficam inalcançáveis
  // de IPs de datacenter (visto do ambiente da Edge Function) — tenta vários.
  const endpoints = [
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];
  let res: Response | null = null;
  for (const ep of endpoints) {
    try {
      const r = await fetchTimeout(
        ep,
        {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
          body: 'data=' + encodeURIComponent(query),
        },
        20_000,
      );
      if (r.ok) { res = r; break; }
    } catch { /* tenta o próximo mirror */ }
  }
  if (!res) throw new Error('Overpass indisponível no momento — tente de novo em instantes.');
  let data: { elements: { id: number; type: string; tags?: Record<string, string>; lat?: number; lon?: number; center?: { lat: number; lon: number } }[] };
  try {
    data = await res.json();
  } catch {
    throw new Error('Overpass retornou uma resposta inesperada — tente de novo em instantes.');
  }

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
