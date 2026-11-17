import { site } from './site-config';

/** Mesmas perguntas do FAQPage (JSON-LD) — o texto visível e o schema não podem divergir. */
export const faqItems = [
    {
        question: 'Quanto custa alugar um container em Jacareí ou no Vale do Paraíba?',
        answer: `O valor depende do tipo de container (escritório, almoxarifado ou sanitário), do tempo de locação e da cidade de entrega. A PH Container faz o orçamento sem compromisso pelo WhatsApp ${site.phone}.`,
    },
    {
        question: 'Quais tipos de container a PH Container aluga?',
        answer: 'Container escritório com ar-condicionado, container depósito e almoxarifado, container banheiro e vestiário, plantão de vendas e refeitório. Os módulos têm 6 metros (20 pés) ou 12 metros (40 pés).',
    },
    {
        question: 'Em quais cidades a PH Container entrega container e Munck?',
        answer: 'Jacareí, São José dos Campos, Taubaté, Pindamonhangaba, Caçapava, Guaratinguetá e todas as cidades do Vale do Paraíba, da Serra da Mantiqueira e do Litoral Norte de São Paulo, de Aparecida a Ubatuba.',
    },
    {
        question: 'Qual o prazo de entrega do container?',
        answer: 'Em geral de 1 a 3 dias úteis após a confirmação do orçamento, conforme a cidade de entrega e a disponibilidade do modelo.',
    },
    {
        question: 'Preciso preparar o local para receber o container?',
        answer: 'O terreno precisa estar nivelado e com acesso livre para o caminhão Munck posicionar o container. A equipe da PH orienta sobre o local antes da entrega.',
    },
    {
        question: 'A PH Container também faz içamento e transporte de cargas?',
        answer: 'Sim. Além dos containers, a PH aluga caminhão Munck (guindauto) para transporte de cargas, operações de carga e descarga, remoção de máquinas e içamento de painéis e totens.',
    },
    {
        question: 'Há quanto tempo a PH Container atua no Vale do Paraíba?',
        answer: 'Desde 1995 — mais de 30 anos de operação, atendendo empresas como Ambev, Heineken, Nestlé, Suzano Celulose e a Prefeitura de Jacareí.',
    },
    {
        question: 'Como solicitar um orçamento com a PH Container?',
        answer: `Pelo WhatsApp ${site.phone}, pelo e-mail ${site.email} ou pelo telefone ${site.phone}.`,
    },
] as const;
