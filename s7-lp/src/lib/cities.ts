// Pool de cidades para a Roleta e o Scanner Local.
// Base inicial: Baixada Santista + Litoral Norte + Vale do Paraíba (SP).
// Ajuste livre — no futuro isso pode vir da tabela `cities` do Supabase.

export type City = { name: string; uf: string; region: string };

export const CITIES: City[] = [
  // Baixada Santista
  { name: 'Santos', uf: 'SP', region: 'Baixada Santista' },
  { name: 'São Vicente', uf: 'SP', region: 'Baixada Santista' },
  { name: 'Praia Grande', uf: 'SP', region: 'Baixada Santista' },
  { name: 'Guarujá', uf: 'SP', region: 'Baixada Santista' },
  { name: 'Cubatão', uf: 'SP', region: 'Baixada Santista' },
  { name: 'Bertioga', uf: 'SP', region: 'Baixada Santista' },
  { name: 'Mongaguá', uf: 'SP', region: 'Baixada Santista' },
  { name: 'Itanhaém', uf: 'SP', region: 'Baixada Santista' },
  { name: 'Peruíbe', uf: 'SP', region: 'Baixada Santista' },
  // Litoral Norte
  { name: 'Caraguatatuba', uf: 'SP', region: 'Litoral Norte' },
  { name: 'São Sebastião', uf: 'SP', region: 'Litoral Norte' },
  { name: 'Ubatuba', uf: 'SP', region: 'Litoral Norte' },
  { name: 'Ilhabela', uf: 'SP', region: 'Litoral Norte' },
  // Vale do Paraíba
  { name: 'São José dos Campos', uf: 'SP', region: 'Vale do Paraíba' },
  { name: 'Taubaté', uf: 'SP', region: 'Vale do Paraíba' },
  { name: 'Jacareí', uf: 'SP', region: 'Vale do Paraíba' },
  { name: 'Pindamonhangaba', uf: 'SP', region: 'Vale do Paraíba' },
  { name: 'Guaratinguetá', uf: 'SP', region: 'Vale do Paraíba' },
  { name: 'Caçapava', uf: 'SP', region: 'Vale do Paraíba' },
  { name: 'Lorena', uf: 'SP', region: 'Vale do Paraíba' },
];

export const REGIONS = [...new Set(CITIES.map((c) => c.region))];
