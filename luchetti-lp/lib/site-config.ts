/**
 * Dados da Luchetti centralizados aqui (fonte: luchetti.com.br, nov/2026).
 * Troque aqui e todo o site (CTAs, rodapé, botão flutuante) se atualiza.
 *
 * ⚠️ Ainda não encontrado no site: horário da loja física (storeHours).
 */
export const site = {
    name: 'Luchetti',
    fullName: 'Luchetti Hidráulica & Impermeabilização',
    legalName: 'Luchetti Comércio de Materiais para Construção Ltda',
    cnpj: '60.190.865/0001-90',
    tagline: 'Hidráulica & Impermeabilização',
    slogan: 'Sua obra, nossas soluções!',
    since: 1941,
    city: 'São José dos Campos',
    region: 'todo o Brasil, com foco no Vale do Paraíba, Litoral Norte, Sul de Minas e Grande São Paulo',
    address: {
        street: 'Av. Rui Barbosa, 651',
        district: 'Vila Zizinha',
        city: 'São José dos Campos',
        state: 'SP',
        zip: '12211-005',
    },
    phone: '(12) 3928-8100',
    whatsapp: '551239288100',
    whatsappMessage: 'Olá! Vim pelo site da Luchetti e gostaria de um orçamento.',
    email: 'vendas@luchetti.com.br',
    instagram: 'https://www.instagram.com/luchettisjc/',
    instagramHandle: '@luchettisjc',
    facebook: 'https://www.facebook.com/luchettipro',
    linkedin: 'https://www.linkedin.com/company/luchetti-com%C3%A9rcio-de-materiais-p-constru%C3%A7%C3%A3o-ltda/',
    youtube: 'https://www.youtube.com/channel/UCs03uJBYHW6aeRrbJ4OF4PQ',
    url: 'https://www.luchetti.com.br',
    storeHours: '',
    products: '10 mil',
    brands: ['Amanco Wavin', 'Deca', 'Celite', 'Acqualimp', 'Bidim'],
} as const;

export const yearsInBusiness = new Date().getFullYear() - site.since;

const phoneDigits = site.phone.replace(/\D/g, '');

export const phoneUrl = `tel:+55${phoneDigits}`;

export const whatsappUrl = site.whatsapp
    ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`
    : '';

/**
 * Link de WhatsApp com a linha de produto já na mensagem, para o representante
 * receber o contexto do orçamento sem precisar perguntar de novo.
 * Sem WhatsApp configurado, cai no mesmo destino dos demais CTAs.
 */
export const whatsappLinkFor = (topic: string) =>
    site.whatsapp
        ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
              `Olá! Vim pelo site da Luchetti e gostaria de um orçamento de ${topic}.`,
          )}`
        : '#contato';

export const contactIsWhatsapp = Boolean(site.whatsapp);

/**
 * Destino dos botões "Solicitar orçamento": abre o WhatsApp quando ele
 * estiver configurado; enquanto isso, rola até o bloco de contato do rodapé.
 */
export const ctaUrl = whatsappUrl || '#contato';

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${site.address.street}, ${site.address.city} - ${site.address.state}, ${site.address.zip}`,
)}`;

/** Atributos para links externos (WhatsApp, mapa, Instagram). */
export const externalLink = { target: '_blank', rel: 'noopener noreferrer' } as const;

export const ctaLinkProps = contactIsWhatsapp ? externalLink : {};

/**
 * Fotos. Hoje são placeholders gerados em /public/fotos — troque pelos
 * arquivos reais mantendo o mesmo nome (ou altere o caminho aqui).
 */
export const photos = {
    hero: '/fotos/hero-loja.jpg',
    hidraulica: '/fotos/linha-hidraulica.jpg',
    impermeabilizacao: '/fotos/linha-impermeabilizacao.jpg',
    gasPci: '/fotos/linha-gas-pci.jpg',
    avacAcabamentos: '/fotos/linha-avac-acabamentos.jpg',
    engenharia: '/fotos/obra-engenharia.jpg',
    construtoras: '/fotos/obra-construtoras.jpg',
    banheiros: '/fotos/obra-banheiros.jpg',
    lajes: '/fotos/obra-lajes.jpg',
    footer: '/fotos/footer-panorama.jpg',
} as const;
