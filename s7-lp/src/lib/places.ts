// Cidades (Brasil inteiro via IBGE) e países do mundo.
// Os JSONs são carregados sob demanda (só nas telas de prospecção/roleta).

export type BrCity = { n: string; uf: string };
export type Country = { cc: string; n: string; cap: string | null; r: string; lat: number | null; lng: number | null };

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

// Atalhos da região da S7 — aparecem no topo dos seletores.
export const FAVORITE_CITIES: BrCity[] = [
  { n: 'Santos', uf: 'SP' }, { n: 'São Vicente', uf: 'SP' }, { n: 'Praia Grande', uf: 'SP' },
  { n: 'Guarujá', uf: 'SP' }, { n: 'Cubatão', uf: 'SP' }, { n: 'Bertioga', uf: 'SP' },
  { n: 'Mongaguá', uf: 'SP' }, { n: 'Itanhaém', uf: 'SP' }, { n: 'Peruíbe', uf: 'SP' },
  { n: 'São Paulo', uf: 'SP' }, { n: 'São José dos Campos', uf: 'SP' }, { n: 'Taubaté', uf: 'SP' },
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

export const BRASIL: Country = { cc: 'BR', n: 'Brasil', cap: 'Brasília', r: 'Americas', lat: -14, lng: -53 };
