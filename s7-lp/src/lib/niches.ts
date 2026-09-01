// Nichos de prospecção da Agência S7.
// `osmTags` mapeia o nicho para tags do OpenStreetMap (fonte gratuita).
// `apifyTerms` são os termos de busca usados no Google Maps (Apify).

export type Niche = {
  slug: string;
  label: string;
  apifyTerms: string[];
  osmTags: string[];
};

export const NICHES: Niche[] = [
  {
    slug: 'alimentacao',
    label: 'Alimentação',
    apifyTerms: ['restaurante', 'lanchonete', 'padaria', 'pizzaria', 'hamburgueria', 'cafeteria'],
    osmTags: ['amenity=restaurant', 'amenity=fast_food', 'amenity=cafe', 'shop=bakery', 'amenity=ice_cream'],
  },
  {
    slug: 'beleza-estetica',
    label: 'Beleza & Estética',
    apifyTerms: ['salão de beleza', 'barbearia', 'clínica de estética', 'studio de sobrancelha', 'nail designer'],
    osmTags: ['shop=hairdresser', 'shop=beauty', 'shop=massage', 'leisure=spa'],
  },
  {
    slug: 'saude',
    label: 'Saúde',
    apifyTerms: ['clínica médica', 'consultório odontológico', 'psicólogo', 'fisioterapia', 'laboratório'],
    osmTags: ['amenity=clinic', 'amenity=doctors', 'amenity=dentist', 'healthcare=physiotherapist', 'amenity=pharmacy'],
  },
  {
    slug: 'fitness-esportes',
    label: 'Fitness & Esportes',
    apifyTerms: ['academia', 'crossfit', 'studio de pilates', 'personal trainer', 'quadra de beach tennis'],
    osmTags: ['leisure=fitness_centre', 'leisure=sports_centre', 'shop=sports'],
  },
  {
    slug: 'comercio',
    label: 'Comércio',
    apifyTerms: ['loja de roupas', 'papelaria', 'pet shop', 'loja de móveis', 'material de construção'],
    osmTags: ['shop=clothes', 'shop=stationery', 'shop=pet', 'shop=furniture', 'shop=doityourself', 'shop=hardware'],
  },
  {
    slug: 'servicos',
    label: 'Serviços',
    apifyTerms: ['oficina mecânica', 'lava rápido', 'chaveiro', 'gráfica', 'assistência técnica'],
    osmTags: ['shop=car_repair', 'shop=car_parts', 'craft=key_cutter', 'shop=copyshop', 'craft=electronics_repair'],
  },
  {
    slug: 'educacao',
    label: 'Educação',
    apifyTerms: ['escola de idiomas', 'curso preparatório', 'escola de música', 'auto escola', 'reforço escolar'],
    osmTags: ['amenity=school', 'amenity=language_school', 'amenity=music_school', 'amenity=driving_school', 'office=educational_institution'],
  },
  {
    slug: 'hospedagem-turismo',
    label: 'Hospedagem & Turismo',
    apifyTerms: ['pousada', 'hotel', 'hostel', 'agência de viagens', 'passeio de barco'],
    osmTags: ['tourism=hotel', 'tourism=guest_house', 'tourism=hostel', 'shop=travel_agency'],
  },
  {
    slug: 'eventos-festas',
    label: 'Eventos & Festas',
    apifyTerms: ['buffet infantil', 'casa de festas', 'decoração de eventos', 'aluguel de brinquedos', 'assessoria de casamento'],
    osmTags: ['amenity=events_venue', 'shop=party', 'craft=caterer'],
  },
  {
    slug: 'imobiliario',
    label: 'Imobiliário',
    apifyTerms: ['imobiliária', 'corretor de imóveis', 'administradora de condomínios'],
    osmTags: ['office=estate_agent', 'shop=estate_agent'],
  },
  {
    slug: 'juridico-contabil',
    label: 'Jurídico & Contábil',
    apifyTerms: ['escritório de advocacia', 'escritório de contabilidade', 'despachante'],
    osmTags: ['office=lawyer', 'office=accountant', 'office=notary', 'office=tax_advisor'],
  },
  {
    slug: 'tecnologia',
    label: 'Tecnologia',
    apifyTerms: ['agência de marketing', 'empresa de software', 'suporte de TI', 'loja de informática'],
    osmTags: ['office=it', 'office=company', 'shop=computer'],
  },
  {
    slug: 'outros',
    label: 'Outros',
    apifyTerms: ['empresa'],
    osmTags: ['office=company'],
  },
];

export const NICHE_BY_SLUG = Object.fromEntries(NICHES.map((n) => [n.slug, n]));
