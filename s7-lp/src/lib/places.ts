// Cidades (Brasil inteiro via IBGE) e países do mundo.
// Os JSONs são carregados sob demanda (só nas telas de prospecção/roleta).

export type BrCity = { n: string; uf: string };
export type Country = { cc: string; n: string; cap: string | null; r: string; lat: number | null; lng: number | null };

/** Localização escolhida à mão: país -> estado (só Brasil) -> cidade. */
export type Place = { country: string; countryCode: string; uf: string; city: string };
export const EMPTY_PLACE: Place = { country: 'Brasil', countryCode: 'BR', uf: '', city: '' };

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const UF_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal',
  ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};

/** opções prontas pro <Select> de estado */
export const UF_OPTIONS = UFS.map((uf) => ({ value: uf, label: UF_NAMES[uf], hint: uf })).sort((a, b) =>
  a.label.localeCompare(b.label, 'pt'),
);

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

