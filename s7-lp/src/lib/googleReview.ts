// Monta o link que leva direto pra tela "Deixe uma avaliação" do Google, sem
// precisar do link especial que só aparece dentro do painel do Google Meu
// Negócio (Perfil da Empresa > Peça avaliações).
//
// A forma oficial e sempre confiável exige o "Place ID" (formato ChIJ...),
// que é grátis de achar no buscador oficial do Google:
// https://developers.google.com/maps/documentation/places/web-service/place-id
//
// Boa parte dos links "Compartilhar" do Google Maps já traz esse ID embutido
// na URL — nesse caso a gente detecta e monta o link sozinho; quando não traz,
// pedimos o Place ID (colado do buscador oficial) em vez de adivinhar.

export function buildReviewLink(placeId: string) {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId.trim())}`;
}

const CHIJ_RE = /(ChIJ[a-zA-Z0-9_-]{15,})/;

/** Acha um Place ID (ChIJ...) dentro de um texto/URL colado. null se não achar. */
export function extractPlaceId(text: string): string | null {
  const m = text.match(CHIJ_RE);
  return m ? m[1] : null;
}

/** Já é um link pronto de avaliação (veio do painel do Google ou já foi montado por nós)? */
export function isReviewLink(text: string) {
  return /writereview|g\.page\/r\//i.test(text);
}

export const PLACE_ID_FINDER_URL = 'https://developers.google.com/maps/documentation/places/web-service/place-id';
