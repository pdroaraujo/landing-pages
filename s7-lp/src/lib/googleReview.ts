// Monta o link que leva direto pra tela "Deixe uma avaliação" do Google, sem
// precisar do link especial que só aparece dentro do painel do Google Meu
// Negócio (Perfil da Empresa > Peça avaliações).
//
// IMPORTANTE (testado na prática em 2026-09-28): esse endpoint só aceita o
// Place ID no formato "ChIJ..." (o da Places API). O CID que aparece no link
// normal do google.com/maps (trecho "!1s0x<hex>:0x<hex>") NÃO funciona aqui —
// testamos com um link real e deu 404. Não tentar essa rota de novo.
//
// O Place ID "ChIJ..." não aparece no link comum do Maps — só tem dois jeitos
// gratuitos de conseguir: (1) o link "Peça avaliações" de dentro do painel do
// Google Meu Negócio, que já vem pronto; (2) o buscador oficial de Place ID do
// Google (sem precisar de chave de API pra uso manual).

export function buildReviewLink(placeId: string) {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId.trim())}`;
}

const CHIJ_RE = /(ChIJ[a-zA-Z0-9_-]{15,})/;

/** Acha um Place ID (ChIJ...) num texto colado — normalmente vem do buscador oficial do Google. */
export function extractPlaceId(text: string): string | null {
  const chij = text.match(CHIJ_RE);
  return chij ? chij[1] : null;
}

/** Já é um link pronto de avaliação (veio do painel do Google ou já foi montado por nós)? */
export function isReviewLink(text: string) {
  return /writereview|g\.page\/r\//i.test(text);
}

export const PLACE_ID_FINDER_URL = 'https://developers.google.com/maps/documentation/places/web-service/place-id';
