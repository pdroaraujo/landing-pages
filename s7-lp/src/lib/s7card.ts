// S7 Card — catálogo de tipos de placa NFC.
// `destination` aceita URL normal pra a maioria; wifi/vcard usam um payload
// especial (ver `placeholder` de cada um como exemplo pro cadastro).

export type LinkType =
  | 'google_review'
  | 'whatsapp'
  | 'instagram'
  | 'menu'
  | 'hub'
  | 'wifi'
  | 'vcard'
  | 'pix'
  | 'coupon'
  | 'other';

export const LINK_TYPES: { key: LinkType; label: string; hint: string; placeholder: string }[] = [
  {
    key: 'google_review',
    label: 'Avaliação Google',
    hint: 'Leva direto pra tela de avaliação do Google Meu Negócio.',
    placeholder: 'https://g.page/r/XXXXXXXXXXXX/review',
  },
  {
    key: 'hub',
    label: 'Hub S7 (vários links)',
    hint: 'Mini-página com vários botões (avaliação, cardápio, redes...). O lojista troca o destino sem trocar a placa.',
    placeholder: 'https://agencias7.com.br/hub/nome-da-loja',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp direto',
    hint: 'Abre uma conversa já com mensagem pronta.',
    placeholder: 'https://wa.me/5513999999999?text=Ol%C3%A1!',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    hint: 'Leva direto pro perfil.',
    placeholder: 'https://instagram.com/perfil_da_loja',
  },
  {
    key: 'menu',
    label: 'Cardápio digital',
    hint: 'PDF ou site do cardápio — bom pra restaurantes/bares.',
    placeholder: 'https://exemplo.com/cardapio.pdf',
  },
  {
    key: 'coupon',
    label: 'Cupom / fidelidade',
    hint: 'Página de cupom de desconto ou cadastro em programa de fidelidade.',
    placeholder: 'https://agencias7.com.br/cupom/xxxx',
  },
  {
    key: 'pix',
    label: 'Pix',
    hint: 'Copia-e-cola ou QR de pagamento — bom pra ambulantes/feiras.',
    placeholder: 'https://nubank.com.br/pagar/xxxxx',
  },
  {
    key: 'vcard',
    label: 'Cartão de contato (vCard)',
    hint: 'Salva o contato do estabelecimento direto na agenda de quem toca.',
    placeholder: 'BEGIN:VCARD\nVERSION:3.0\nFN:Nome da Loja\nTEL:+5513999999999\nEND:VCARD',
  },
  {
    key: 'wifi',
    label: 'Wi-Fi automático',
    hint: 'Conecta o celular no Wi-Fi da loja sem digitar senha.',
    placeholder: 'WIFI:S:NomeDaRede;T:WPA;P:senha123;;',
  },
  {
    key: 'other',
    label: 'Outro',
    hint: 'Qualquer outro link.',
    placeholder: 'https://...',
  },
];

export const linkTypeInfo = (key: string) => LINK_TYPES.find((t) => t.key === key) ?? LINK_TYPES[LINK_TYPES.length - 1];

export type S7CardStore = {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  city: string | null;
  uf: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  status: 'ativa' | 'inativa';
  sold_value: number;
  sold_at: string;
  notes: string | null;
  created_at: string;
  reviews_baseline: number | null;
  reviews_baseline_at: string | null;
  reviews_current: number | null;
  reviews_updated_at: string | null;
};

export type S7CardTag = {
  id: string;
  code: string;
  link_type: LinkType;
  destination: string;
  label: string | null;
  store_id: string | null;
  status: 'em_estoque' | 'instalada' | 'defeito';
  installed_at: string | null;
  created_at: string;
  store?: S7CardStore;
  taps_count?: number;
};

export type ProspectStatus = 'a_prospectar' | 'prospectado' | 'vendido' | 'descartado';

export type S7CardProspect = {
  id: string;
  dedup_key: string | null;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  uf: string | null;
  category: string | null;
  website: string | null;
  status: ProspectStatus;
  notes: string | null;
  store_id: string | null;
  created_at: string;
};

/** Mesma lógica de dedup da prospecção da agência: nome+telefone+cidade normalizados. */
export function prospectDedupKey(name: string, phone: string | null, city: string | null): string {
  const slug = (s: string) =>
    (s ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  const digits = (s: string | null) => (s ?? '').replace(/\D/g, '').replace(/^55/, '');
  return `${slug(name)}|${digits(phone)}|${slug(city ?? '')}`;
}
