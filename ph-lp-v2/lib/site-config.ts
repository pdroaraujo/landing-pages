/**
 * Dados da PH Container centralizados aqui. NAP (nome, endereço, telefone)
 * precisa ficar idêntico ao Perfil da Empresa no Google — não invente variações.
 */
export const site = {
    name: 'PH Container',
    url: 'https://phcontainer.com.br',
    since: 1995,
    address: {
        street: 'Av. Nicola Capucci, 391',
        district: 'Cidade Jardim',
        city: 'Jacareí',
        state: 'SP',
        zip: '12320-330',
    },
    geo: { lat: -23.342372, lng: -45.968033 },
    phone: '(12) 99724-8156',
    whatsapp: '5512997248156',
    whatsappMessage: 'Olá! Vim pelo site da PH Container e gostaria de um orçamento.',
    email: 'contato@phcontainer.com.br',
    instagram: 'https://www.instagram.com/phcontainer/',
    instagramHandle: '@phcontainer',
    mapsUrl: 'https://www.google.com/maps?cid=8205083714264096334',
    /** TODO: trocar pelo link curto de avaliação do Perfil da Empresa (g.page/r/.../review). */
    reviewUrl: 'https://www.google.com/maps?cid=8205083714264096334',
    /** ⚠️ Horário estimado — confirmar com a PH. */
    hours: 'Seg a sex, 7h30 às 17h30 · Sáb, 8h às 12h',
    clients: [
        { name: 'Ambev', logo: '/parceiros/ambev.webp' },
        { name: 'Heineken', logo: '/parceiros/heineken.webp' },
        { name: 'Nestlé', logo: '/parceiros/nestle.webp' },
        { name: 'Suzano', logo: '/parceiros/suzano-celulose.webp' },
        { name: 'Cebrace', logo: '/parceiros/cebrace.webp' },
        { name: 'Prefeitura de Jacareí', logo: '/parceiros/prefeitura-de-jacarei.webp' },
        { name: 'SAAE Jacareí', logo: '/parceiros/saae.webp' },
    ],
} as const;

export const yearsInBusiness = new Date().getFullYear() - site.since;

export const phoneUrl = `tel:+${site.whatsapp}`;

export const whatsappUrl = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`;

/** WhatsApp com o assunto já na mensagem, para a equipe receber o contexto do orçamento. */
export const whatsappFor = (topic: string) =>
    `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
        `Olá! Vim pelo site da PH Container e gostaria de um orçamento de ${topic}.`,
    )}`;

export const externalLink = { target: '_blank', rel: 'noopener' } as const;

export const fullAddress = `${site.address.street}, ${site.address.district}, ${site.address.city} - ${site.address.state}, ${site.address.zip}`;

export const photos = {
    hero: '/fotos/hero-munck-container.webp',
    escritorio: '/fotos/container-escritorio.webp',
    almoxarifado: '/fotos/container-almoxarifado.webp',
    sanitario: '/fotos/container-sanitario.webp',
    munck: '/fotos/munck-icamento.webp',
    obra: '/fotos/aplicacao-obra.webp',
    industria: '/fotos/aplicacao-industria.webp',
    plantao: '/fotos/aplicacao-plantao.webp',
    totem: '/fotos/aplicacao-totem.webp',
    patio: '/fotos/patio-containers.webp',
    estrada: '/fotos/estrada-noite.webp',
    container: '/bg-container.webp',
} as const;
