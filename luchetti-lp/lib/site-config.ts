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
    engenharia: '/fotos/obra-engenharia.jpg',
    construtoras: '/fotos/obra-construtoras.jpg',
    banheiros: '/fotos/obra-banheiros.jpg',
    lajes: '/fotos/obra-lajes.jpg',
    footer: '/fotos/footer-panorama.jpg',
    // Fotos reais do acervo da Luchetti (luchetti.com.br).
    impermeabilizacaoReal: '/fotos/linha-impermeabilizacao-real.webp',
    pciReal: '/fotos/linha-pci-real.webp',
    avacReal: '/fotos/linha-avac-real.webp',
} as const;

/** Linha do tempo com o acervo histórico da família (fonte: luchetti.com.br/sobre-nós). */
export const timeline = [
    { year: '1900', caption: 'As famílias italianas Luchetta e Simon', image: '/fotos/historia/1900-familias.webp', alt: 'Retrato antigo das famílias de imigrantes italianos Luchetta e Simon' },
    { year: '1940', caption: 'Os primeiros anos da Luchetti', image: '/fotos/historia/1940.webp', alt: 'Prédio da Luchetti na década de 1940' },
    { year: '1980', caption: 'A loja na década de 80', image: '/fotos/historia/1980-loja.webp', alt: 'Fachada da loja Luchetti nos anos 1980' },
    { year: '1990', caption: 'Década de 90', image: '/fotos/historia/1990.webp', alt: 'Galpões da Luchetti na década de 1990' },
    { year: '2000', caption: 'O projeto da fachada verde', image: '/fotos/historia/2000-fachada.webp', alt: 'Projeto da fachada verde da Luchetti' },
    { year: 'Hoje', caption: 'A sede em São José dos Campos', image: '/fotos/historia/hoje-aerea.webp', alt: 'Vista aérea da sede da Luchetti' },
] as const;

/** "Nossa Essência" — texto literal do site institucional. */
export const essence = [
    { title: 'Missão', text: 'Ser o parceiro ideal no fornecimento de materiais para a construção civil, garantindo entregas rápidas e soluções eficazes para seus projetos.' },
    { title: 'Visão', text: 'Ser a marca ícone das melhores soluções, reconhecida pela excelência, compromisso com a sustentabilidade e a satisfação do cliente.' },
    { title: 'Valores', text: 'Construir soluções, com o foco do cliente, que atendam às suas necessidades e gerem um impacto positivo na sociedade e no meio ambiente.' },
] as const;

/** Catálogo completo das linhas (fonte: luchetti.com.br/soluções). */
export const catalog = [
    {
        title: 'Hidráulica',
        topic: 'hidráulica',
        intro: 'Soluções completas para sistemas hidráulicos em obras comerciais, residenciais, industriais, rurais e agrícolas.',
        groups: [
            { name: 'Linhas', items: ['Tubos', 'Conexões', 'Válvulas', 'Registros', 'Bombas', 'Complementos hidráulicos'] },
            { name: 'Infraestrutura', items: ['PEAD', 'Coletor', 'PBA', 'Drenagem', 'Geossintéticos', 'DEFOFO', 'FoFo'] },
            { name: 'Reservatórios', items: ['Fossas', 'Biodigestores', 'Cisternas', 'Grandes reservatórios'] },
        ],
    },
    {
        title: 'Impermeabilização & linha técnica',
        topic: 'impermeabilização',
        intro: 'Mantas, membranas, argamassas e aditivos para proteger lajes, reservatórios e estruturas.',
        groups: [{ name: 'Linhas', items: ['Mantas asfálticas', 'Membranas líquidas', 'Selantes', 'Grautes', 'Aditivos químicos', 'Argamassas especiais', 'Isolantes térmicos e acústicos'] }],
    },
    {
        title: 'Gás',
        topic: 'gás',
        intro: 'Multicamadas, termofusão, PEAD e tudo o que a instalação de gás precisa.',
        groups: [{ name: 'Linhas', items: ['Tubos', 'Conexões', 'Reguladores', 'Válvulas', 'Ferramentas'] }],
    },
    {
        title: 'PCI',
        subtitle: 'Proteção e combate a incêndio',
        topic: 'PCI (combate a incêndio)',
        intro: 'Materiais de alta performance para projetos de combate a incêndio, que protegem o patrimônio e a segurança de todos.',
        groups: [{ name: 'Linhas', items: ['Amanco Fire', 'Ranhurado', 'Galvanizado', 'Aço carbono'] }],
    },
    {
        title: 'AVAC',
        subtitle: 'Aquecimento, ventilação e ar-condicionado',
        topic: 'AVAC',
        intro: 'Conforto térmico e qualidade do ar em ambientes comerciais, residenciais e industriais.',
        groups: [{ name: 'Equipamentos', items: ['Aquecimento', 'Ventilação', 'Ar-condicionado'] }],
    },
    {
        title: 'Acabamentos',
        topic: 'acabamentos',
        intro: 'Design, acessibilidade, segurança e durabilidade para obras residenciais, comerciais e industriais.',
        groups: [{ name: 'Linhas', items: ['Louças sanitárias', 'Acabamentos metálicos', 'Revestimentos', 'Acessórios', 'Soluções para acessibilidade'] }],
    },
] as const;
