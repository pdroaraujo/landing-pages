// Monta o link que leva direto pra tela "Deixe uma avaliação" do Google, sem
// precisar do link especial que só aparece dentro do painel do Google Meu
// Negócio (Perfil da Empresa > Peça avaliações).
//
// Quando você abre uma loja no google.com/maps, o endereço na barra do
// navegador traz um trecho "!1s0x<hex>:0x<hex>" — esse é o CID interno do
// Google pra aquele lugar. Testado com um link real (loja em Jacareí, SP,
// 2026-09-28): esse mesmo CID funciona direto como "placeid" no link de
// avaliação, sem precisar do Place ID (ChIJ...) da API paga do Google.
//
// Se o link colado não tiver esse trecho (ex: veio de outro buscador, não do
// Google Maps), caímos pro Place ID "ChIJ..." — grátis de achar no buscador
// oficial do Google — como plano B.

export function buildReviewLink(placeId: string) {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId.trim())}`;
}

const CID_RE = /!1s(0x[0-9a-fA-F]+:0x[0-9a-fA-F]+)/;
const CHIJ_RE = /(ChIJ[a-zA-Z0-9_-]{15,})/;

/** Acha o CID (do link do google.com/maps) ou um Place ID (ChIJ...) num texto/URL colado. */
export function extractPlaceId(text: string): string | null {
  const cid = text.match(CID_RE);
  if (cid) return cid[1];
  const chij = text.match(CHIJ_RE);
  return chij ? chij[1] : null;
}

/** Já é um link pronto de avaliação (veio do painel do Google ou já foi montado por nós)? */
export function isReviewLink(text: string) {
  return /writereview|g\.page\/r\//i.test(text);
}

export const PLACE_ID_FINDER_URL = 'https://developers.google.com/maps/documentation/places/web-service/place-id';
