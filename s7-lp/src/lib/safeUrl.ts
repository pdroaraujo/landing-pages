// Links e redirecionamentos montados com valores do banco (site importado de
// planilha, destino da placa cadastrado por vendedor) só podem usar protocolos
// "inertes". Sem isso, um valor `javascript:...` vira código rodando no domínio
// agencias7.com.br — onde ficam as sessões do painel.
const DEFAULT_PROTOCOLS = ['http:', 'https:'];

export function safeHref(raw: string | null | undefined, protocols: string[] = DEFAULT_PROTOCOLS): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`);
    return protocols.includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

// Destinos que a página pública /r/:code pode abrir (WhatsApp/Instagram/Google
// são https; tel/mailto/sms cobrem contato direto).
export const TAP_PROTOCOLS = ['http:', 'https:', 'tel:', 'mailto:', 'sms:'];

/** Mensagem de erro para o destino de uma placa, ou null se estiver ok. */
export function tagDestinationError(linkType: string, destination: string): string | null {
  if (linkType === 'wifi' || linkType === 'vcard') return null;
  return safeHref(destination, TAP_PROTOCOLS) && /^(https?|tel|mailto|sms):/i.test(destination.trim())
    ? null
    : 'O destino precisa ser um link completo começando com https:// (ou tel:, mailto:, sms:).';
}
