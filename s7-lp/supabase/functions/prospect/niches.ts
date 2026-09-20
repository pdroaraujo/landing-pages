// Espelho de src/lib/niches.ts para uso na Edge Function (Deno).
export type Niche = { slug: string; label: string; searchTerms: string[]; osmTags: string[] };

export const NICHES: Niche[] = [
  { slug: 'alimentacao', label: 'Alimentação', searchTerms: ['restaurante', 'lanchonete', 'padaria', 'pizzaria', 'hamburgueria', 'cafeteria'], osmTags: ['amenity=restaurant', 'amenity=fast_food', 'amenity=cafe', 'shop=bakery', 'amenity=ice_cream'] },
  { slug: 'beleza-estetica', label: 'Beleza & Estética', searchTerms: ['salão de beleza', 'barbearia', 'clínica de estética', 'studio de sobrancelha'], osmTags: ['shop=hairdresser', 'shop=beauty', 'shop=massage', 'leisure=spa'] },
  { slug: 'saude', label: 'Saúde', searchTerms: ['clínica médica', 'consultório odontológico', 'psicólogo', 'fisioterapia', 'laboratório'], osmTags: ['amenity=clinic', 'amenity=doctors', 'amenity=dentist', 'healthcare=physiotherapist', 'amenity=pharmacy'] },
  { slug: 'fitness-esportes', label: 'Fitness & Esportes', searchTerms: ['academia', 'crossfit', 'studio de pilates', 'personal trainer'], osmTags: ['leisure=fitness_centre', 'leisure=sports_centre', 'shop=sports'] },
  { slug: 'comercio', label: 'Comércio', searchTerms: ['loja de roupas', 'papelaria', 'pet shop', 'loja de móveis', 'material de construção'], osmTags: ['shop=clothes', 'shop=stationery', 'shop=pet', 'shop=furniture', 'shop=doityourself', 'shop=hardware'] },
  { slug: 'servicos', label: 'Serviços', searchTerms: ['oficina mecânica', 'lava rápido', 'chaveiro', 'gráfica', 'assistência técnica'], osmTags: ['shop=car_repair', 'shop=car_parts', 'craft=key_cutter', 'shop=copyshop', 'craft=electronics_repair'] },
  { slug: 'educacao', label: 'Educação', searchTerms: ['escola de idiomas', 'curso preparatório', 'escola de música', 'auto escola', 'reforço escolar'], osmTags: ['amenity=school', 'amenity=language_school', 'amenity=music_school', 'amenity=driving_school', 'office=educational_institution'] },
  { slug: 'hospedagem-turismo', label: 'Hospedagem & Turismo', searchTerms: ['pousada', 'hotel', 'hostel', 'agência de viagens'], osmTags: ['tourism=hotel', 'tourism=guest_house', 'tourism=hostel', 'shop=travel_agency'] },
  { slug: 'eventos-festas', label: 'Eventos & Festas', searchTerms: ['buffet infantil', 'casa de festas', 'decoração de eventos', 'assessoria de casamento'], osmTags: ['amenity=events_venue', 'shop=party', 'craft=caterer'] },
  { slug: 'imobiliario', label: 'Imobiliário', searchTerms: ['imobiliária', 'corretor de imóveis', 'administradora de condomínios'], osmTags: ['office=estate_agent', 'shop=estate_agent'] },
  { slug: 'juridico-contabil', label: 'Jurídico & Contábil', searchTerms: ['escritório de advocacia', 'escritório de contabilidade', 'despachante'], osmTags: ['office=lawyer', 'office=accountant', 'office=notary', 'office=tax_advisor'] },
  { slug: 'tecnologia', label: 'Tecnologia', searchTerms: ['agência de marketing', 'empresa de software', 'suporte de TI', 'loja de informática'], osmTags: ['office=it', 'office=company', 'shop=computer'] },
  { slug: 'outros', label: 'Outros', searchTerms: ['empresa'], osmTags: ['office=company'] },
];

export const nicheBySlug = (slug: string) => NICHES.find((n) => n.slug === slug) ?? NICHES[NICHES.length - 1];
