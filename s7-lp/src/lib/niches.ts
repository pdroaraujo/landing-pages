// Nichos de prospecção da Agência S7: categoria -> tipos de negócio.
// `types` alimenta o seletor "Escolher" e os chips de refino da Roleta.
// `searchTerms` são exemplos usados no prompt de importação quando nenhum tipo específico é escolhido.

export type Niche = {
  slug: string;
  label: string;
  types: string[];
  searchTerms: string[];
};

export const NICHES: Niche[] = [
  {
    slug: 'alimentacao',
    label: 'Alimentação',
    types: ['Restaurante', 'Pizzaria', 'Hamburgueria', 'Sorveteria', 'Padaria', 'Cafeteria', 'Bar', 'Lanchonete', 'Doceria', 'Açaiteria', 'Sushi / Japonês', 'Churrascaria', 'Pastelaria', 'Food Truck'],
    searchTerms: ['restaurante', 'lanchonete', 'padaria', 'pizzaria', 'hamburgueria', 'cafeteria'],
  },
  {
    slug: 'beleza-estetica',
    label: 'Beleza & Estética',
    types: ['Salão de Beleza', 'Barbearia', 'Manicure / Pedicure', 'Design de Sobrancelha', 'Clínica de Estética', 'Depilação', 'SPA', 'Maquiagem', 'Extensão de Cílios', 'Bronzeamento'],
    searchTerms: ['salão de beleza', 'barbearia', 'clínica de estética', 'studio de sobrancelha', 'nail designer'],
  },
  {
    slug: 'saude',
    label: 'Saúde',
    types: ['Clínica Geral', 'Dentista', 'Fisioterapia', 'Psicólogo', 'Nutricionista', 'Oftalmologista', 'Dermatologista', 'Pediatra', 'Ortopedista', 'Veterinário', 'Farmácia', 'Laboratório'],
    searchTerms: ['clínica médica', 'consultório odontológico', 'psicólogo', 'fisioterapia', 'laboratório'],
  },
  {
    slug: 'fitness-esportes',
    label: 'Fitness & Esportes',
    types: ['Academia', 'CrossFit', 'Pilates', 'Yoga', 'Natação', 'Artes Marciais', 'Personal Trainer', 'Escola de Dança', 'Escola de Futebol', 'Quadra de Tênis'],
    searchTerms: ['academia', 'crossfit', 'studio de pilates', 'personal trainer', 'quadra de beach tennis'],
  },
  {
    slug: 'comercio',
    label: 'Comércio',
    types: ['Loja de Roupas', 'Loja de Calçados', 'Loja de Móveis', 'Eletrônicos', 'Mercado / Supermercado', 'Pet Shop', 'Floricultura', 'Papelaria', 'Ótica', 'Joalheria', 'Livraria', 'Loja de Brinquedos'],
    searchTerms: ['loja de roupas', 'papelaria', 'pet shop', 'loja de móveis', 'material de construção'],
  },
  {
    slug: 'servicos',
    label: 'Serviços',
    types: ['Oficina Mecânica', 'Lava Jato', 'Borracharia', 'Eletricista', 'Encanador', 'Pintor', 'Marcenaria', 'Vidraçaria', 'Chaveiro', 'Dedetização', 'Lavanderia', 'Costureira / Alfaiate'],
    searchTerms: ['oficina mecânica', 'lava rápido', 'chaveiro', 'gráfica', 'assistência técnica'],
  },
  {
    slug: 'educacao',
    label: 'Educação',
    types: ['Escola', 'Curso de Idiomas', 'Autoescola', 'Curso de Informática', 'Curso Profissionalizante', 'Aula Particular', 'Creche', 'Escola de Música'],
    searchTerms: ['escola de idiomas', 'curso preparatório', 'escola de música', 'auto escola', 'reforço escolar'],
  },
  {
    slug: 'hospedagem-turismo',
    label: 'Hospedagem & Turismo',
    types: ['Hotel', 'Pousada', 'Hostel', 'Motel', 'Agência de Viagem', 'Guia Turístico', 'Aluguel de Temporada'],
    searchTerms: ['pousada', 'hotel', 'hostel', 'agência de viagens', 'passeio de barco'],
  },
  {
    slug: 'eventos-festas',
    label: 'Eventos & Festas',
    types: ['Buffet', 'Casa de Festas', 'Decoração de Festas', 'Fotógrafo', 'DJ', 'Cerimonialista', 'Aluguel de Vestidos', 'Convites'],
    searchTerms: ['buffet infantil', 'casa de festas', 'decoração de eventos', 'aluguel de brinquedos', 'assessoria de casamento'],
  },
  {
    slug: 'imobiliario',
    label: 'Imobiliário',
    types: ['Imobiliária', 'Corretor de Imóveis', 'Construtora', 'Arquiteto', 'Designer de Interiores', 'Engenheiro Civil'],
    searchTerms: ['imobiliária', 'corretor de imóveis', 'administradora de condomínios'],
  },
  {
    slug: 'juridico-contabil',
    label: 'Jurídico & Contábil',
    types: ['Advogado', 'Contador', 'Despachante', 'Cartório', 'Consultoria Empresarial'],
    searchTerms: ['escritório de advocacia', 'escritório de contabilidade', 'despachante'],
  },
  {
    slug: 'tecnologia',
    label: 'Tecnologia',
    types: ['Assistência Técnica', 'Loja de Informática', 'Desenvolvimento Web', 'Marketing Digital', 'Provedor de Internet'],
    searchTerms: ['agência de marketing', 'empresa de software', 'suporte de TI', 'loja de informática'],
  },
  {
    slug: 'outros',
    label: 'Outros',
    types: [],
    searchTerms: ['empresa'],
  },
];

export const NICHE_BY_SLUG = Object.fromEntries(NICHES.map((n) => [n.slug, n]));
