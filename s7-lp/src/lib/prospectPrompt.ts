// Prompt pronto pra colar no Claude — pede pra ele buscar empresas no Google
// Maps e devolver num CSV que a Roleta consegue importar direto.
import type { Niche } from './niches';

export function buildImportPrompt(niche: Niche, city: string, uf?: string, country = 'Brasil') {
  const loc = [city, uf, country !== 'Brasil' ? country : null].filter(Boolean).join(', ');
  const examples = niche.searchTerms.slice(0, 5).join(', ');
  return `Busque empresas do ramo "${niche.label}" em ${loc} usando o Google Maps — tipos de negócio como: ${examples}.

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
