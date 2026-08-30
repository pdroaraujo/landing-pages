import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Menu, X, ArrowRight, ArrowUpRight } from 'lucide-react';

// Animated Counter Component
function AnimatedCounter({ to, suffix = "", duration = 2 }: { to: number, suffix?: string, duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        setCount(Math.floor(progress * to));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    } else {
      setCount(0);
    }
  }, [isInView, to, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// Staggered Text Reveal Component (Nakula Style)
const RevealText = ({ text, className = "" }: { text: string, className?: string }) => {
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 * i },
    }),
  };

  const child = {
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] as const } },
    hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
  };

  return (
    <motion.h2 
      className={`flex flex-wrap gap-x-[0.25em] gap-y-2 ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-100px" }}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.h2>
  );
};

// Fade In Wrapper
const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: [0.2, 0.65, 0.3, 0.9] as const }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [view, setView] = useState<'home' | 'portfolio'>('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (view === 'portfolio') {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-[#f4f4f5] flex flex-col items-center justify-center font-sans relative overflow-hidden selection:bg-[#fe0000] selection:text-white">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[900px] bg-[#fe0000] rounded-full blur-[180px] opacity-[0.35] pointer-events-none z-0"></div>
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6 text-white">
            Portfólio em <br/><span className="text-[#fe0000]">Construção</span>
          </h1>
          <p className="text-white/60 mb-12 uppercase tracking-widest text-sm max-w-md">
            Estamos preparando projetos incríveis para mostrar a você em breve.
          </p>
          <button onClick={() => { window.scrollTo(0,0); setView('home'); }} className="group relative overflow-hidden border border-white/20 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-widest text-white flex items-center justify-center">
            <div className="absolute inset-0 bg-[#fe0000] transform -translate-x-[105%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
            <span className="relative z-10 transition-colors">Voltar para o Início</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f4f4f5] font-sans selection:bg-[#fe0000] selection:text-white relative overflow-x-hidden">
      
      {/* BACKGROUND DA HERO SECTION (Glow Vermelho Escuro) */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[900px] bg-[#fe0000] rounded-full blur-[180px] opacity-[0.35] pointer-events-none z-0"></div>

      {/* HEADER */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0f0f0f]/90 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between items-center">
          <a href="#" className="flex items-center gap-2 z-50 relative">
            <img src="/logo.png" alt="S7" className="h-20 md:h-28 w-auto drop-shadow-xl" />
          </a>
          
          <div className="flex items-center gap-2 md:gap-4 z-50">
            {/* Botão Fale Conosco (Animação Esquerda -> Direita SEM SETA) */}
            <a href="https://wa.me/5513936283974?text=Ol%C3%A1%2C%20desejo%20falar%20com%20um%20especialista!" className="hidden sm:flex group relative overflow-hidden border border-white/20 rounded-full px-6 py-3 text-xs md:text-sm font-bold uppercase tracking-widest text-white items-center justify-center">
              <div className="absolute inset-0 bg-[#fe0000] transform -translate-x-[105%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
              <span className="relative z-10 transition-colors">Fale Conosco</span>
            </a>
            
            {/* Menu Toggle */}
            <button 
              className="w-10 h-10 md:w-12 md:h-12 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" 
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* FULLSCREEN MENU NAKULA STYLE */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-[#0c0c0c] flex flex-col justify-between"
          >
            {/* Menu Header */}
            <div className="flex justify-between items-center px-6 md:px-12 py-8 border-b border-white/5">
              <a href="#" onClick={() => setIsMenuOpen(false)}>
                <img src="/logo.png" alt="S7" className="h-16 md:h-20 w-auto opacity-50 hover:opacity-100 transition-opacity" />
              </a>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-white/50 text-xs tracking-widest font-medium uppercase">
                  <span className="w-1.5 h-1.5 bg-[#fe0000]"></span> MENU
                </div>
                <button 
                  className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Menu Links */}
            <div className="flex-grow flex flex-col justify-center px-6 md:px-12 max-w-[1400px] mx-auto w-full">
              <nav className="flex flex-col gap-0 w-full">
                {[
                  { name: "INÍCIO", href: "#" },
                  { name: "PORTFÓLIO", href: "#works" },
                  { name: "SOBRE", href: "#about" },
                  { name: "SERVIÇOS", href: "#services" }
                ].map((link, idx) => (
                  <motion.a 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    key={idx} 
                    href={link.href} 
                    onClick={() => setIsMenuOpen(false)} 
                    className="text-5xl md:text-8xl font-bold tracking-tighter uppercase py-4 border-b border-white/5 text-white/80 hover:text-white transition-colors group flex items-end gap-2"
                  >
                    {link.name} 
                    <span className="w-2 h-2 md:w-3 md:h-3 bg-[#fe0000] mb-3 md:mb-5 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* Menu Footer */}
            <div className="px-6 md:px-12 pb-12 pt-8 max-w-[1400px] mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-8">
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-32 md:pt-48 relative z-10">
        
        {/* HERO SECTION */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 mb-32 md:mb-48 relative">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[16vw] sm:text-[12vw] md:text-5xl lg:text-[8vw] font-bold tracking-tighter leading-[0.9] uppercase max-w-[1200px]"
          >
            A ÚNICA <br className="md:hidden" /> AGÊNCIA <br /> QUE VOCÊ <br className="md:hidden" /> PRECISA.
          </motion.h1>
          
          <div className="mt-16 md:mt-24 grid md:grid-cols-2 gap-12 items-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex items-center gap-4 text-sm sm:text-base md:text-sm font-medium tracking-widest text-white/50"
            >
              <div className="w-12 h-[1px] bg-white/20"></div>
              <p className="uppercase">Disponível para novos projetos<br/>
              <span className="text-[#fe0000]">HOJE MESMO</span></p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex justify-start md:justify-end"
            >
              <a href="https://wa.me/5513936283974?text=Ol%C3%A1%2C%20desejo%20falar%20com%20um%20especialista!" className="group relative overflow-hidden border border-white/20 rounded-full px-6 py-4 sm:px-8 sm:py-4 text-sm sm:text-base md:text-base font-bold uppercase tracking-widest text-white flex items-center justify-between sm:justify-center gap-3 w-full sm:w-auto">
                <div className="absolute inset-0 bg-[#fe0000] transform -translate-x-[105%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
                <span className="relative z-10 transition-colors">Falar com especialista</span>
                <ArrowRight size={18} className="relative z-10 transition-colors duration-500 ease-out" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* ABOUT (Word by Word Reveal Animation) */}
        <section id="about" className="max-w-[1400px] mx-auto px-6 md:px-12 mb-32 md:mb-48">
          <div className="grid lg:grid-cols-12 gap-8 md:gap-16 pt-16 md:pt-24 border-t border-white/10">
            <div className="lg:col-span-3">
              <span className="text-sm font-medium tracking-widest text-white/50">(SOBRE NÓS)</span>
            </div>
            <div className="lg:col-span-9">
              <RevealText 
                text="Combinamos anos de experiência em Web Design, SEO e Google Meu Negócio para criar marcas fortes e experiências digitais focadas em conversão." 
                className="text-3xl md:text-5xl lg:text-[54px] font-medium tracking-tight text-white leading-[1.2]"
              />
            </div>
          </div>
        </section>

        {/* LATEST WORK (Single Project) */}
        <section id="works" className="max-w-[1400px] mx-auto px-6 md:px-12 mb-32 md:mb-48">
          <FadeIn className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 mb-12 gap-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">Último Trabalho</h2>
            <span className="text-sm font-medium tracking-widest text-white/50">(PROJETOS)</span>
          </FadeIn>
          
          <div className="max-w-5xl mx-auto">
            <a href="https://phcontainer.com.br" target="_blank" rel="noopener noreferrer" className="group block cursor-pointer">
              <FadeIn delay={0.2}>
                <div className="w-full aspect-video bg-[#111] mb-8 overflow-hidden relative border border-white/10">
                  <img src="/phcontainer-site.jpg" alt="PH Container" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
                </div>
              </FadeIn>
              
              <FadeIn delay={0.3} className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-3xl font-bold tracking-tight uppercase group-hover:text-[#fe0000] transition-colors">PH CONTAINER</h3>
                  <p className="text-sm text-white/50 tracking-wide uppercase mt-2">Web Design, Google&nbsp; Meu&nbsp; Negócio & SEO</p>
                </div>
                <ArrowUpRight className="text-white/30 group-hover:text-[#fe0000] transition-colors" size={32} />
              </FadeIn>
            </a>

            <FadeIn delay={0.4} className="text-center mt-16 mb-8">
              <p className="text-lg md:text-xl font-medium tracking-widest text-white/60 uppercase">
                O seu projeto pode ser o próximo a estar aqui.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.5} className="flex justify-center mt-8">
              <button onClick={() => { window.scrollTo(0,0); setView('portfolio'); }} className="group relative overflow-hidden border border-white/20 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-widest text-white flex items-center justify-center">
                <div className="absolute inset-0 bg-[#fe0000] transform -translate-x-[105%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
                <span className="relative z-10 transition-colors">VER MAIS PROJETOS</span>
              </button>
            </FadeIn>
          </div>
        </section>

        {/* NUMBERS DON'T LIE (Tradução) */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 mb-32 md:mb-48">
          <FadeIn>
            <div className="grid lg:grid-cols-2 gap-8 mb-16 items-end">
              <div>
                <span className="text-xs font-medium tracking-widest text-white/50 mb-8 block">(POR QUE NÓS)</span>
                <h2 className="text-[12vw] lg:text-[140px] font-bold tracking-tighter uppercase leading-[0.8]">
                  NÚMEROS<br/>NÃO MENTEM
                </h2>
              </div>
              <div className="hidden lg:flex justify-end pb-4">
                <p className="text-white/50 text-base max-w-sm leading-relaxed">
                  Com profunda expertise em SEO, Web Design e Google&nbsp; Meu&nbsp; Negócio, criamos marcas fortes e experiências digitais de alto impacto que geram resultados orgânicos excepcionais.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-b border-white/10">
              {[
                { num: 50, suffix: "+", label: "Serviços Entregues", duration: 0.75 },
                { num: 3, suffix: "+", label: "Anos de Experiência", duration: 0.25 },
                { num: 99, suffix: "%", label: "Taxa de Satisfação", duration: 1.5 },
                { num: 1, suffix: "º", label: "No Google Local", duration: 0.75 }
              ].map((stat, idx) => (
                <div key={idx} className={`p-8 md:p-12 border-white/10 ${idx !== 3 ? 'border-r' : ''} ${idx < 2 ? 'border-b lg:border-b-0' : ''}`}>
                  <h3 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">
                    <AnimatedCounter to={stat.num} duration={stat.duration} />
                    <span className="text-[#fe0000]">{stat.suffix}</span>
                  </h3>
                  <p className="text-sm text-white/50 uppercase tracking-widest pt-4">{stat.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* COMO PODEMOS AJUDAR (SERVIÇOS) */}
        <section id="services" className="max-w-[1400px] mx-auto px-6 md:px-12 mb-32 md:mb-48">
          <FadeIn className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 mb-12 gap-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">Como podemos ajudar</h2>
            <span className="text-sm font-medium tracking-widest text-white/50">(SERVIÇOS)</span>
          </FadeIn>

          <div className="grid">
            {[
              {
                title: "Criação de Sites",
                desc: "Sites de alta performance, projetados especificamente para converter visitantes em clientes, com um design único.",
                items: ["Design Exclusivo", "Alta Performance", "Otimizado para Mobile", "Foco em Conversão"]
              },
              {
                title: "SEO Estratégico",
                desc: "Posicionamento orgânico que faz os seus clientes te encontrarem no Google exatamente no momento da busca.",
                items: ["Pesquisa de Palavras-chave", "Otimização On-page", "Link Building", "Conteúdo Estratégico"]
              },
              {
                title: "Google Meu Negócio",
                desc: "Domine as pesquisas locais da sua região e receba contatos diários de pessoas querendo o seu serviço.",
                items: ["Configuração Completa", "Otimização de Perfil", "Gestão de Avaliações", "Monitoramento Local"]
              }
            ].map((service, idx) => (
              <FadeIn key={idx} delay={idx * 0.1} className="border-b border-white/10 py-12 md:py-16 grid lg:grid-cols-12 gap-8 md:gap-16 group">
                <div className="lg:col-span-5 flex gap-4">
                  <span className="text-[#fe0000] text-3xl leading-none font-bold">.</span>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-4 group-hover:text-[#fe0000] transition-colors">
                      {service.title === "Google Meu Negócio" ? (
                        <>Google &nbsp;&nbsp;Meu &nbsp;&nbsp;Negócio</>
                      ) : (
                        service.title
                      )}
                    </h3>
                    <p className="text-white/60 text-lg leading-relaxed">{service.desc}</p>
                  </div>
                </div>
                <div className="lg:col-span-4 lg:col-start-9 flex flex-col justify-center">
                  <ul className="space-y-4">
                    {service.items.map((item, i) => (
                      <li key={i} className="text-sm uppercase tracking-widest text-white/80 border-b border-white/5 pb-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* PROCESS */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 mb-32 md:mb-48">
          <FadeIn className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 mb-12 gap-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">Como Nós Trabalhamos</h2>
            <span className="text-sm font-medium tracking-widest text-white/50">(PROCESSO)</span>
          </FadeIn>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10">
            {[
              { num: "1", title: "Conteúdo / Pesquisa", items: ["Prospecção", "Estrutura de copy", "UX/UI research"] },
              { num: "2", title: "Criação / UI Design", items: ["Sketch", "Wireframe", "Protótipo", "Validação"] },
              { num: "3", title: "Dev / Otimização", items: ["Setup Inicial", "DEV Otimizado"] },
              { num: "4", title: "Comercial / Proposta", items: ["Setup jurídico", "Setup financeiro"] },
              { num: "5", title: "Briefing / Alinhamento", items: ["Reunião de briefing", "Alinhamento de projeto"] },
              { num: "6", title: "Entrega", items: ["DEP", "Relatório Técnico", "Style Guide"] }
            ].map((step, idx) => (
              <FadeIn key={idx} delay={idx * 0.1} className="p-8 md:p-10 border-b border-r border-white/10 hover:bg-white/[0.02] transition-colors">
                <h3 className="text-xl font-bold tracking-widest text-white/60 uppercase mb-8">
                  PASSO {step.num}<span className="text-[#fe0000]">.</span>
                </h3>
                <h4 className="text-2xl font-bold tracking-tighter uppercase mb-6 leading-tight">{step.title}</h4>
                <ul className="space-y-3">
                  {step.items.map((item, i) => (
                    <li key={i} className="text-white/60 text-sm font-medium flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-[#fe0000] rounded-full"></span> {item}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 mb-32 md:mb-48">
          <FadeIn className="grid lg:grid-cols-3 gap-16 border-t border-b border-white/10 py-16 md:py-24">
            <div className="lg:col-span-1">
              <h2 className="text-5xl font-bold tracking-tighter mb-4">99%</h2>
              <p className="text-sm uppercase tracking-widest text-white/50">Taxa de Satisfação dos Nossos Clientes</p>
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight mb-12 text-white/80">
                "O trabalho com a Agência S7 foi incrivelmente focado. O site ficou impressionante, o processo fluiu super bem, e o melhor: o retorno no Google Meu Negócio foi imediato."
              </h3>
              <div className="flex items-center gap-4">
                <img src="/phcontainer-logo.webp" alt="PH Container" loading="lazy" decoding="async" className="w-12 h-12 rounded-full object-contain bg-white p-1.5" />
                <div>
                  <h4 className="font-bold tracking-wider uppercase text-sm">Washington Ferreira</h4>
                  <p className="text-white/50 text-sm">PH Container</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* VAMOS TRABALHAR JUNTOS (CTA) */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 mb-24 text-center">
          <FadeIn>
            <h2 className="text-[10vw] leading-[0.8] font-bold tracking-tighter uppercase mb-16 cursor-pointer group transition-all duration-700 ease-out hover:scale-[1.02]">
              <span className="text-white group-hover:text-[#fe0000] transition-colors duration-700">VAMOS TRABALHAR <br/> JUNTOS?</span>
            </h2>
            
            <div className="flex justify-center items-center mt-16">
              <a href="https://wa.me/5513936283974?text=Ol%C3%A1%2C%20desejo%20falar%20com%20um%20especialista!" className="group relative overflow-hidden border border-white/20 rounded-full px-12 py-5 text-sm font-bold uppercase tracking-widest text-white flex items-center justify-center gap-3">
                <div className="absolute inset-0 bg-[#fe0000] transform -translate-x-[105%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
                <span className="relative z-10 transition-colors">Falar com um Especialista</span>
              </a>
            </div>
          </FadeIn>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="pt-16 pb-8 border-t border-white/10">
        <FadeIn className="max-w-[1400px] mx-auto px-6 md:px-12">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
            
            {/* EMAIL */}
            <div className="flex flex-col items-start md:col-span-1">
              <span className="text-xs uppercase tracking-widest text-white/50 block mb-6">(EMAIL)</span>
              <div className="flex flex-col gap-4 text-sm font-bold uppercase">
                <a href="mailto:contato.agencias7@outlook.com" className="relative group w-fit text-white">
                  <span className="relative z-10 transition-colors">contato.agencias7@outlook.com</span>
                  <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-[#fe0000] transition-all duration-300 ease-out group-hover:w-full"></span>
                </a>
              </div>
            </div>

            {/* LINKS (CENTERED) */}
            <div className="flex flex-col md:items-center text-left md:text-center md:col-span-1">
              <div>
                <span className="text-xs uppercase tracking-widest text-white/50 block mb-6">(LINKS)</span>
                <div className="flex flex-col gap-4 text-sm font-bold uppercase">
                  <a href="#about" className="relative group w-fit md:mx-auto text-white">
                    <span className="relative z-10 transition-colors">Sobre</span>
                    <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-[#fe0000] transition-all duration-300 ease-out group-hover:w-full"></span>
                  </a>
                  <a href="#works" className="relative group w-fit md:mx-auto text-white">
                    <span className="relative z-10 transition-colors">Portfólio</span>
                    <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-[#fe0000] transition-all duration-300 ease-out group-hover:w-full"></span>
                  </a>
                  <a href="#services" className="relative group w-fit md:mx-auto text-white">
                    <span className="relative z-10 transition-colors">Serviços</span>
                    <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-[#fe0000] transition-all duration-300 ease-out group-hover:w-full"></span>
                  </a>
                </div>
              </div>
            </div>

            {/* SOCIALS */}
            <div className="flex flex-col md:items-end text-left md:text-right md:col-span-1">
              <div>
                <span className="text-xs uppercase tracking-widest text-white/50 block mb-6">(REDES SOCIAIS)</span>
                <div className="flex flex-col gap-4 text-sm font-bold uppercase">
                  <a href="https://instagram.com/s7.sites" target="_blank" rel="noopener noreferrer" className="relative group w-fit md:ml-auto text-white flex items-center gap-1">
                    <span className="relative z-10 transition-colors">Instagram</span>
                    <ArrowUpRight size={16} className="relative z-10 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-[#fe0000] transition-all duration-300 ease-out group-hover:w-full"></span>
                  </a>
                  <a href="/politica-de-privacidade.html" className="relative group w-fit md:ml-auto text-white">
                    <span className="relative z-10 transition-colors">Política de Privacidade</span>
                    <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-[#fe0000] transition-all duration-300 ease-out group-hover:w-full"></span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-8 border-t border-white/10 text-xs tracking-widest text-white/50 uppercase gap-4">
            <p>@ 2026 AGÊNCIA S7. TODOS OS DIREITOS RESERVADOS.</p>
          </div>
        </FadeIn>
      </footer>

    </div>
  );
}
