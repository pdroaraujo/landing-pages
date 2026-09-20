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
  if (!res) throw new Error('Overpass indisponível no momento — tente de novo em instantes.');
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
