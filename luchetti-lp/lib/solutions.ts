/**
 * Páginas de soluções (/solucoes/<slug>), uma por card da home.
 * Textos e listas vêm de luchetti.com.br/soluções.
 */
export type SolutionGroup = { name?: string; items: readonly string[] };

export type SolutionBlock = {
    title: string;
    subtitle?: string;
    image: string;
    imageAlt: string;
    paragraphs: readonly string[];
    listTitle: string;
    groups: readonly SolutionGroup[];
};

export type Solution = {
    slug: string;
    title: string;
    /** Usado na mensagem do WhatsApp: "...orçamento de <topic>." */
    topic: string;
    tagline: string;
    blocks: readonly SolutionBlock[];
};

export const solutions: readonly Solution[] = [
    {
        slug: 'hidraulica',
        title: 'Hidráulica',
        topic: 'hidráulica',
        tagline: 'Soluções completas para sistemas hidráulicos.',
        blocks: [
            {
                title: 'Hidráulica',
                image: '/fotos/linha-hidraulica-real.webp',
                imageAlt: 'Barragem com vertedouros aberta, obra de infraestrutura hidráulica',
                paragraphs: [
                    'Desde os antigos egípcios, com seus sofisticados sistemas de irrigação, até os romanos, com seus grandiosos aquedutos, a hidráulica esteve presente em praticamente toda a história da humanidade, devido ao papel fundamental da água para a vida humana. Esse recurso essencial exigiu que os povos, ao longo das mais diversas épocas, se desenvolvessem para controlá-lo e utilizá-lo em seu benefício. Hoje, não é diferente, com a hidráulica presente em todos os setores, como o comercial, residencial, industrial, rural e agrícola.',
                    'A Luchetti, com sua vasta experiência na área, é sua principal parceira para construir um futuro mais eficiente e responsável.',
                ],
                listTitle: 'Nossas linhas de soluções',
                groups: [
                    { name: 'Linhas', items: ['Tubos', 'Conexões', 'Válvulas', 'Registros', 'Bombas', 'Complementos hidráulicos'] },
                    { name: 'Infraestrutura', items: ['PEAD', 'Coletor', 'PBA', 'Drenagem', 'Geossintéticos', 'Defofo', 'Fofo'] },
                    { name: 'Reservatórios', items: ['Fossas', 'Biodigestores', 'Cisternas', 'Grandes reservatórios'] },
                ],
            },
        ],
    },
    {
        slug: 'impermeabilizacao',
        title: 'Impermeabilização',
        topic: 'impermeabilização',
        tagline: 'Mantas, argamassas, aditivos e pinturas asfálticas.',
        blocks: [
            {
                title: 'Impermeabilização & linha técnica',
                image: '/fotos/linha-impermeabilizacao-real.webp',
                imageAlt: 'Aplicação de manta asfáltica',
                paragraphs: [
                    'Desde as primeiras civilizações, as preocupações com infiltrações, corrosão, fungos e mofo, problemas causados pelo contato da água nas estruturas, já eram evidenciadas nas construções e arquiteturas da época. Diversos materiais naturais eram utilizados como forma de evitar a penetração da água nos alicerces das construções, como argila, cal, óleos naturais e resinas, alguns dos quais ainda são usados hoje na composição de produtos modernos.',
                    'A Luchetti, com sua vasta experiência, é sua principal parceira na escolha das melhores soluções para impermeabilização e proteção estrutural.',
                ],
                listTitle: 'Nossas linhas de soluções',
                groups: [
                    { items: ['Mantas asfálticas', 'Membranas líquidas', 'Selantes', 'Grautes', 'Aditivos químicos', 'Argamassas especiais', 'Isolantes térmicos e acústicos'] },
                ],
            },
        ],
    },
    {
        slug: 'gas-e-pci',
        title: 'Gás e PCI',
        topic: 'gás e PCI',
        tagline: 'Multicamadas, termofusão, PEAD e materiais de alta performance para combate a incêndio.',
        blocks: [
            {
                title: 'Gás',
                image: '/fotos/linha-gas-real.webp',
                imageAlt: 'Medidores e tubulação de gás',
                paragraphs: [
                    'Desde a Primeira Revolução Industrial, o gás tem desempenhado um papel fundamental em nossas vidas, presente em inúmeros aspectos do dia a dia. Sua importância abrange desde as atividades mais simples, como a preparação de alimentos e o aquecimento de ambientes, até as mais complexas, como a geração de eletricidade.',
                    'A Luchetti oferece uma ampla linha de soluções nesse segmento, trazendo variedade, segurança e inovação ao setor.',
                ],
                listTitle: 'Nossas linhas de soluções',
                groups: [{ items: ['Tubos', 'Conexões', 'Reguladores', 'Válvulas', 'Ferramentas'] }],
            },
            {
                title: 'PCI',
                subtitle: 'Proteção e combate a incêndio',
                image: '/fotos/linha-pci-real.webp',
                imageAlt: 'Tubulação vermelha de combate a incêndio com sprinklers',
                paragraphs: [
                    'A segurança de uma edificação é um investimento fundamental. Um Projeto de Combate a Incêndio (PCI) bem elaborado garante a integridade da estrutura, protegendo seu patrimônio e garantindo a segurança de todos.',
                    'A Luchetti oferece uma ampla gama de materiais de alta performance para PCI, desenvolvidos para resistir ao fogo e retardar a propagação das chamas.',
                ],
                listTitle: 'Nossas linhas de soluções',
                groups: [{ items: ['Amanco Fire', 'Ranhurado (Grooved)', 'Galvanizado', 'Aço carbono'] }],
            },
        ],
    },
    {
        slug: 'avac-e-acabamentos',
        title: 'AVAC e acabamentos',
        topic: 'AVAC e acabamentos',
        tagline: 'Aquecimento, ventilação, ar-condicionado e acabamentos que aliam beleza, qualidade e funcionalidade.',
        blocks: [
            {
                title: 'AVAC',
                subtitle: 'Aquecimento, ventilação e ar-condicionado',
                image: '/fotos/linha-avac-real.webp',
                imageAlt: 'Duto e difusor de ar-condicionado',
                paragraphs: [
                    'O controle da temperatura e qualidade do ar tem sido uma preocupação constante ao longo da história, desde as primeiras tentativas de resfriamento de ambientes no Egito antigo até as invenções modernas que transformaram nosso modo de viver e trabalhar. O sistema AVAC (Aquecimento, Ventilação e Ar-Condicionado) é hoje indispensável em diversos setores, trazendo conforto térmico e promovendo a qualidade do ar em ambientes comerciais, residenciais e industriais.',
                    'A Luchetti, com sua experiência no setor, é sua parceira de confiança para garantir que seu ambiente tenha as melhores soluções para sistemas de aquecimento, ventilação e ar-condicionado.',
                ],
                listTitle: 'Nossas linhas de soluções para equipamentos de',
                groups: [{ items: ['Aquecimento', 'Ventilação', 'Ar-condicionado'] }],
            },
            {
                title: 'Acabamentos',
                image: '/fotos/linha-acabamentos-real.webp',
                imageAlt: 'Instalação de sifão metálico em pia',
                paragraphs: [
                    'Os acabamentos sempre desempenharam um papel importante nas construções ao longo da história. No passado, eram utilizados principalmente para decorar ambientes, mas hoje, eles vão muito além da estética. Além de trazerem design e sofisticação ao projeto, os acabamentos modernos também são essenciais para garantir acessibilidade, segurança, durabilidade e elegância.',
                    'Seja em obras residenciais, comerciais ou industriais, os acabamentos asseguram que os espaços sejam funcionais, seguros e inclusivos para todos os usuários.',
                    'A Luchetti oferece uma ampla linha de soluções que aliam beleza, qualidade e funcionalidade, tornando-se sua principal parceira para criar ambientes com os mais altos padrões.',
                ],
                listTitle: 'Nossas linhas de soluções',
                groups: [{ items: ['Louças sanitárias', 'Acabamentos metálicos', 'Revestimentos', 'Acessórios', 'Soluções para acessibilidade'] }],
            },
        ],
    },
];

export const getSolution = (slug: string) => solutions.find((solution) => solution.slug === slug);
