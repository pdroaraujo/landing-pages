import dados from './cidades.json';

export type Regiao = 'RMVale' | 'Litoral Norte' | 'Mantiqueira' | 'Bragantina';
export type Cidade = { nome: string; slug: string; regiao: Regiao; onda: number; nota: string };

export const cidades = dados.cidades as Cidade[];

export const regiaoNome: Record<Regiao, string> = {
    RMVale: 'Região Metropolitana do Vale do Paraíba',
    'Litoral Norte': 'Litoral Norte de São Paulo',
    Mantiqueira: 'Serra da Mantiqueira',
    Bragantina: 'Região Bragantina',
};

export const regiaoTexto: Record<Regiao, string> = {
    RMVale: 'na Região Metropolitana do Vale do Paraíba',
    'Litoral Norte': 'no Litoral Norte de São Paulo',
    Mantiqueira: 'na Serra da Mantiqueira',
    Bragantina: 'na divisa com a região Bragantina',
};

export const cidadePath = (c: Cidade) => `/container-em-${c.slug}/`;

export const cidadeBySlug = (slug: string) => cidades.find((c) => c.slug === slug);

/** Cidades em ordem alfabética agrupadas por região (para o hub e a home). */
export const cidadesPorRegiao = (Object.keys(regiaoNome) as Regiao[])
    .map((regiao) => ({
        regiao,
        nome: regiaoNome[regiao],
        cidades: cidades.filter((c) => c.regiao === regiao).sort((a, b) => a.nome.localeCompare(b.nome, 'pt')),
    }))
    .filter((g) => g.cidades.length > 0);

export function prazoLongo(c: Cidade) {
    if (c.slug === 'ilhabela') return 'de 3 a 5 dias úteis (inclui a travessia de balsa a partir de São Sebastião)';
    if (c.regiao === 'Litoral Norte') return 'de 2 a 4 dias úteis';
    if (c.onda === 1) return 'de 1 a 2 dias úteis';
    if (c.onda === 2) return 'de 2 a 3 dias úteis';
    return 'de 2 a 4 dias úteis';
}

export function prazoCurto(c: Cidade) {
    if (c.regiao === 'Litoral Norte') return '2 a 4 dias';
    if (c.onda === 1) return '1 a 2 dias';
    if (c.onda === 2) return '2 a 3 dias';
    return '2 a 4 dias';
}

/** Remove travessões usados como pontuação nas notas do JSON. */
export const limpaTraco = (s: string) => s.replace(/\s*[–—]\s*/g, ', ').replace(/\s+-\s+/g, ', ').trim();

export function vizinhas(c: Cidade, n = 8) {
    const mesma = cidades.filter((x) => x.regiao === c.regiao && x.slug !== c.slug);
    const outras = cidades.filter((x) => x.regiao !== c.regiao && x.slug !== c.slug);
    return [...mesma, ...outras].slice(0, n);
}
