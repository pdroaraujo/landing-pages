import { Link } from 'react-router-dom';
import { Search, Radar, Dices, ArrowRight } from 'lucide-react';
import { Card } from '../../components/admin/ui';

const modes = [
  {
    to: '/admin/prospeccao/buscar',
    icon: Search,
    title: 'Encontrar Clientes',
    desc: 'Escolha o nicho e a cidade (Brasil ou mundo). Busca empresas, verifica site e traz tudo para você qualificar.',
    bullets: ['Busca por nicho e cidade', 'Verificação de site + parecer IA', 'Qualificação antes da lista'],
  },
  {
    to: '/admin/prospeccao/scanner',
    icon: Radar,
    title: 'Scanner Local',
    desc: 'Varre vários nichos de uma cidade ou região de uma vez e ranqueia as melhores oportunidades por potencial.',
    bullets: ['Escaneamento por região', 'Análise de oportunidades', 'Pontuação de potencial'],
  },
  {
    to: '/admin/prospeccao/roleta',
    icon: Dices,
    title: 'Roleta',
    desc: 'Sem ideia de por onde começar? Gira a roleta: ela sorteia nicho + cidade e já dispara a prospecção.',
    bullets: ['Sorteio de nicho', 'Sorteio de cidade', 'Prospecção automática'],
  },
];

export default function Prospeccao() {
  return (
    <div>
      <div className="text-center mb-12 mt-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#fe0000]/30 bg-[#fe0000]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#fe0000]">
          <Dices size={13} /> Prospecção Inteligente
        </span>
        <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tighter">Como deseja prospectar?</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm text-white/50">
          Escolha a modalidade ideal para encontrar novos clientes e expandir a carteira.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {modes.map((m) => (
          <Card key={m.to} className="flex flex-col p-7 hover:border-[#fe0000]/40 transition-colors">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fe0000]/15 text-[#fe0000]">
              <m.icon size={20} />
            </span>
            <h3 className="mt-5 text-xl font-bold tracking-tight">{m.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/50">{m.desc}</p>
            <ul className="mt-5 flex flex-col gap-2">
              {m.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-xs text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#fe0000]" /> {b}
                </li>
              ))}
            </ul>
            <Link
              to={m.to}
              className="group mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#fe0000]"
            >
              Começar <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
