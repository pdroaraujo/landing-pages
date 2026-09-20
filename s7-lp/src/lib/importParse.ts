// Lê um arquivo CSV ou XLSX de empresas (gerado manualmente, ex: pedindo pro
// Claude buscar no Google Maps) e normaliza pro formato que a prospecção usa.
// `xlsx` é importado sob demanda (só quando alguém realmente sobe um arquivo),
// pra não engordar o chunk da Roleta à toa.

export type ImportedBiz = {
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

const ALIASES: Record<string, string[]> = {
  name: ['nome', 'empresa', 'name', 'company', 'title', 'razao_social', 'razaosocial'],
  phone: ['telefone', 'fone', 'celular', 'whatsapp', 'phone', 'tel', 'contato'],
  address: ['endereco', 'address', 'rua', 'logradouro'],
  city: ['cidade', 'city', 'municipio'],
  uf: ['uf', 'estado', 'state'],
  category: ['categoria', 'category', 'segmento', 'ramo', 'tipo'],
  website: ['site', 'website', 'url', 'link', 'sitelink'],
  rating: ['avaliacao', 'nota', 'rating', 'score', 'estrelas'],
  reviews: ['avaliacoes', 'numero_avaliacoes', 'qtd_avaliacoes', 'quantidade_avaliacoes', 'reviews', 'reviewcount'],
  place_id: ['place_id', 'placeid', 'google_id', 'googleid'],
};

function normHeader(h: string) {
  return h
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export async function parseImportFile(file: File): Promise<ImportedBiz[]> {
  const XLSX = await import('xlsx');
  const isCsv = /\.csv$/i.test(file.name) || file.type.includes('csv') || file.type === 'text/plain';
  const wb = isCsv
    ? XLSX.read(await file.text(), { type: 'string' })
    : XLSX.read(await file.arrayBuffer(), { type: 'array' });

  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName], { defval: '' });
  if (!rows.length) return [];

  // cabeçalho original -> campo canônico
  const headerMap = new Map<string, string>();
  for (const rawHeader of Object.keys(rows[0])) {
    const nh = normHeader(rawHeader);
    for (const [field, aliases] of Object.entries(ALIASES)) {
      if (aliases.includes(nh)) {
        headerMap.set(rawHeader, field);
        break;
      }
    }
  }

  const out: ImportedBiz[] = [];
  for (const row of rows) {
    const rec: Record<string, unknown> = {};
    for (const [rawHeader, val] of Object.entries(row)) {
      const field = headerMap.get(rawHeader);
      if (field && val !== '') rec[field] = val;
    }
    const name = String(rec.name ?? '').trim();
    if (!name) continue;
    out.push({
      place_id: rec.place_id ? String(rec.place_id).trim() : null,
      name,
      phone: rec.phone ? String(rec.phone).trim() : null,
      website: rec.website ? String(rec.website).trim() : null,
      address: rec.address ? String(rec.address).trim() : null,
      city: rec.city ? String(rec.city).trim() : null,
      uf: rec.uf ? String(rec.uf).trim().toUpperCase().slice(0, 2) : null,
      category: rec.category ? String(rec.category).trim() : null,
      rating: toNumber(rec.rating),
      reviews: rec.reviews !== undefined ? Math.round(toNumber(rec.reviews) ?? 0) || null : null,
      lat: null,
      lng: null,
    });
  }
  return out;
}
