// Prompt pronto pra colar no Claude — pede pra ele buscar empresas no Google
// Maps e devolver num CSV que o import (Roleta da agência ou Mapeamento do
// S7 Card) consegue ler direto.
import type { Niche } from './niches';

function csvPrompt(ramo: string, city: string, uf?: string, country = 'Brasil') {
  const loc = [city, uf, country !== 'Brasil' ? country : null].filter(Boolean).join(', ');
  return `Busque empresas ${ramo} em ${loc} usando o Google Maps.

Pra cada empresa encontrada, devolva uma linha de um CSV com EXATAMENTE estas colunas (primeira linha = cabeçalho; nenhum texto antes ou depois do CSV):

nome,telefone,endereco,cidade,categoria,site,avaliacao,avaliacoes

Regras de cada coluna:
- nome: nome da empresa como aparece no Google Maps
- telefone: com DDD, ex: (13) 99999-8888 — deixe vazio se não achar
- endereco: endereço completo
- cidade: ${city}
- categoria: categoria do Google Maps (ex: Restaurante, Salão de beleza, Escritório de advocacia)
- site: URL do site oficial — deixe vazio se a empresa não tiver site próprio
- avaliacao: nota de 0 a 5 — vazio se não tiver
- avaliacoes: número de avaliações — vazio se não tiver

Traga o máximo de empresas reais e verificadas que encontrar no Google Maps (ideal: 50 a 150). NÃO invente empresas — só inclua as que você realmente encontrou. Responda SOMENTE com o CSV, sem explicação antes ou depois.`;
}

/** Usado na Roleta da agência — nicho vem do catálogo fixo de NICHES. */
export function buildImportPrompt(niche: Niche, city: string, uf?: string, country = 'Brasil', type?: string) {
  if (type) return csvPrompt(`do tipo "${type}" (categoria ${niche.label})`, city, uf, country);
  const examples = niche.searchTerms.slice(0, 5).join(', ');
  return csvPrompt(`do ramo "${niche.label}" — tipos de negócio como: ${examples}`, city, uf, country);
}

/** Usado no Mapeamento do S7 Card — descrição livre do tipo de estabelecimento. */
export function buildGenericImportPrompt(description: string, city: string, uf?: string) {
  return csvPrompt(description.trim() || 'de qualquer ramo', city, uf);
}
