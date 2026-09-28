// Cidades (Brasil inteiro via IBGE) e países do mundo.
// Os JSONs são carregados sob demanda (só nas telas de prospecção/roleta).

export type BrCity = { n: string; uf: string };
export type Country = { cc: string; n: string; cap: string | null; r: string; lat: number | null; lng: number | null };

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

let _br: BrCity[] | null = null;
let _countries: Country[] | null = null;

export async function loadBrCities(): Promise<BrCity[]> {
  if (!_br) _br = (await import('../data/br-municipios.json')).default as BrCity[];
  return _br;
}

export async function loadCountries(): Promise<Country[]> {
  if (!_countries) _countries = (await import('../data/paises.json')).default as Country[];
  return _countries;
}

// Prospecção internacional da S7: só Europa + EUA + Dubai (EAU).
const EXTRA_CC = new Set(['US', 'AE']);
export function worldCountries(all: Country[]): Country[] {
  return all
    .filter((c) => c.r === 'Europe' || EXTRA_CC.has(c.cc))
    .map((c) => (c.cc === 'AE' ? { ...c, n: 'Emirados Árabes (Dubai)', cap: 'Dubai' } : c))
    .sort((a, b) => a.n.localeCompare(b.n, 'pt'));
}

