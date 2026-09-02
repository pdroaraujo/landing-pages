// gerar-cidades.mjs — gera uma página estática por cidade a partir de _dados/cidades.json
// Uso:  node _build/gerar-cidades.mjs
// Saída: <raiz do ph-lp>/container-em-<slug>/index.html  (+ /cidades/index.html + lista de URLs)
// Sem dependências. A home (index.html) NÃO é tocada.
// Visual alinhado ao site: mesmas variáveis de cor, header/footer idênticos,
// hero com imagem + overlay azul, cards de serviço, faixa de números e CTA em degradê.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const dados = JSON.parse(fs.readFileSync(path.join(ROOT, "_dados", "cidades.json"), "utf8"));

const WA = "https://wa.me/5512997248156?text=Ol%C3%A1.%20Gostaria%20de%20solicitar%20um%20or%C3%A7amento!";
const MAPS = "https://www.google.com/maps?cid=8205083714264096334";
const TEL = "(12) 99724-8156";

const REGIAO_TXT = {
  "RMVale": "na Região Metropolitana do Vale do Paraíba",
  "Litoral Norte": "no Litoral Norte de São Paulo",
  "Mantiqueira": "na Serra da Mantiqueira",
  "Bragantina": "na divisa com a região Bragantina",
};

const REGIAO_NOME = {
  "RMVale": "Região Metropolitana do Vale do Paraíba",
  "Litoral Norte": "Litoral Norte de São Paulo",
  "Mantiqueira": "Serra da Mantiqueira",
  "Bragantina": "Região Bragantina",
};

function prazoLongo(c) {
  if (c.slug === "ilhabela") return "de 3 a 5 dias úteis (inclui a travessia de balsa a partir de São Sebastião)";
  if (c.regiao === "Litoral Norte") return "de 2 a 4 dias úteis";
  if (c.onda === 1) return "de 1 a 2 dias úteis";
  if (c.onda === 2) return "de 2 a 3 dias úteis";
  return "de 2 a 4 dias úteis";
}
function prazoCurto(c) {
  if (c.regiao === "Litoral Norte") return "2 a 4 dias";
  if (c.onda === 1) return "1 a 2 dias";
  if (c.onda === 2) return "2 a 3 dias";
  return "2 a 4 dias";
}

// remove qualquer hífen/travessão usado como pontuação nos textos vindos do JSON
function limpaTraco(s) {
  return String(s || "").replace(/\s*[–—]\s*/g, ", ").replace(/\s+-\s+/g, ", ").trim();
}

const CSS = `
  .subpage main{overflow-x:hidden}
  .sp-hero{position:relative;padding:170px 0 90px;color:#fff;background:linear-gradient(rgba(48,48,146,.86),rgba(36,36,112,.94)),url('/bg-container.webp') center/cover no-repeat}
  .sp-hero .container{position:relative;z-index:2}
  .sp-crumb{font-size:14px;color:rgba(255,255,255,.72);margin-bottom:16px}
  .sp-crumb a{color:rgba(255,255,255,.92)}
  .sp-crumb a:hover{text-decoration:underline}
  .sp-chip{display:inline-block;padding:8px 16px;margin-bottom:20px;border-radius:100px;font-size:13px;font-weight:600;letter-spacing:.01em;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.34);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
  .sp-hero h1{font-size:clamp(30px,5.2vw,52px);line-height:1.12;margin:0 0 18px;max-width:15ch;color:#fff;letter-spacing:-.02em}
  .sp-hero .lead{font-size:clamp(16px,2vw,20px);line-height:1.65;color:rgba(255,255,255,.9);max-width:54ch;margin:0 0 32px}
  .sp-actions{display:flex;flex-wrap:wrap;gap:14px}
  .sp-hero .btn-primary{background:#fff;color:var(--brand-blue)}
  .sp-hero .btn-primary:hover{background:#eef0ff}
  .btn-ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.55)}
  .btn-ghost:hover{background:rgba(255,255,255,.12);transform:translateY(-2px)}

  .sp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:-52px;position:relative;z-index:6}
  .sp-stat{background:var(--bg-primary);border:1px solid var(--border-color);border-radius:18px;padding:24px 18px;box-shadow:var(--shadow-md);text-align:center}
  .sp-stat .n{font-size:clamp(22px,2.6vw,30px);font-weight:800;color:var(--brand-blue);line-height:1.05;letter-spacing:-.02em}
  .sp-stat .l{font-size:13.5px;color:var(--text-gray);margin-top:8px;line-height:1.4}

  .sp-section{padding:76px 0}
  .sp-lead-h{max-width:640px;margin:0 auto 48px;text-align:center}
  .sp-lead-h h2{font-size:clamp(26px,3.4vw,36px);margin-bottom:14px}
  .sp-lead-h p{color:var(--text-gray);font-size:17px}

  .sp-block{max-width:760px}
  .sp-block h2{font-size:clamp(24px,3vw,32px);margin-bottom:16px}
  .sp-block p{font-size:17px;line-height:1.75;margin-bottom:16px;color:var(--text-dark)}
  .sp-block p.muted{color:var(--text-gray)}

  .sp-checks{display:grid;gap:14px;margin:24px 0 0;padding:0;list-style:none}
  .sp-checks li{position:relative;padding-left:34px;font-size:16px;line-height:1.55;color:var(--text-dark)}
  .sp-checks li::before{content:'';position:absolute;left:0;top:1px;width:20px;height:20px;border-radius:6px;background:var(--brand-blue-light)}
  .sp-checks li::after{content:'';position:absolute;left:7px;top:4px;width:5px;height:10px;border-right:2px solid var(--brand-blue);border-bottom:2px solid var(--brand-blue);transform:rotate(45deg)}

  .sp-faq{display:grid;gap:12px;max-width:760px;margin:0 auto}
  .sp-faq details{border:1px solid var(--border-color);border-radius:14px;padding:18px 22px;background:var(--bg-primary);transition:var(--transition)}
  .sp-faq details[open]{border-color:rgba(48,48,146,.28);box-shadow:var(--shadow-sm)}
  .sp-faq summary{list-style:none;cursor:pointer;font-weight:600;font-size:16px;color:var(--text-dark);display:flex;align-items:center;justify-content:space-between;gap:16px}
  .sp-faq summary::-webkit-details-marker{display:none}
  .sp-faq summary::after{content:'';flex-shrink:0;width:9px;height:9px;border-right:2px solid var(--brand-blue);border-bottom:2px solid var(--brand-blue);transform:rotate(45deg);transition:transform .2s ease}
  .sp-faq details[open] summary::after{transform:rotate(-135deg)}
  .sp-faq details p{margin:14px 0 0;color:var(--text-gray);line-height:1.7;font-size:15.5px}

  .sp-map{display:grid;grid-template-columns:1.35fr 1fr;gap:32px;align-items:stretch}
  .sp-map iframe{width:100%;min-height:340px;height:100%;border:0;border-radius:20px;box-shadow:var(--shadow-md);display:block}
  .sp-addr{background:var(--bg-alt);border:1px solid var(--border-color);border-radius:20px;padding:30px;display:flex;flex-direction:column;justify-content:center;gap:12px}
  .sp-addr h3{font-size:20px}
  .sp-addr p{color:var(--text-gray);line-height:1.6;font-size:15px}
  .sp-addr a{color:var(--brand-blue);font-weight:600}
  .sp-addr a:hover{color:var(--brand-blue-hover)}

  .sp-clients{color:var(--text-gray);font-size:16px;text-align:center;max-width:660px;margin:0 auto;line-height:1.7}
  .sp-clients strong{color:var(--text-dark);font-weight:600}

  .sp-near{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}
  .sp-near a{border:1px solid var(--border-color);border-radius:100px;padding:9px 16px;font-size:14px;font-weight:500;color:var(--text-dark);background:var(--bg-primary);transition:var(--transition)}
  .sp-near a:hover{border-color:var(--brand-blue);color:var(--brand-blue);transform:translateY(-1px)}
  .sp-near a.all{background:var(--brand-blue);color:#fff;border-color:var(--brand-blue)}

  .sp-hub-group{margin-bottom:44px}
  .sp-hub-group:last-child{margin-bottom:0}
  .sp-hub-group h2{font-size:22px;margin-bottom:18px}

  .anim{animation:spFade .6s ease both}
  @keyframes spFade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.anim{animation:none}}

  @media (max-width:900px){
    .sp-stats{grid-template-columns:1fr 1fr;margin-top:28px}
    .sp-map{grid-template-columns:1fr}
    .sp-section{padding:60px 0}
  }
  @media (max-width:560px){
    .sp-hero{padding:140px 0 64px}
    .sp-actions .btn{width:100%}
  }
`;

function head(c, opts = {}) {
  const title = opts.title || `Locação de Container em ${c.nome} | PH Container`;
  const desc = opts.desc || `Aluguel de container escritório, almoxarifado e sanitário e caminhão Munck em ${c.nome} e região. PH Container: mais de 30 anos no Vale do Paraíba. Peça orçamento pelo WhatsApp.`;
  const url = opts.url || `https://phcontainer.com.br/container-em-${c.slug}/`;
  const ld = opts.ld || `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Locação de container e caminhão Munck",
      "provider": { "@id": "https://phcontainer.com.br/#business" },
      "areaServed": { "@type": "City", "name": ${JSON.stringify(c.nome)}, "containedInPlace": { "@type": "AdministrativeArea", "name": "Vale do Paraíba, SP" } },
      "url": ${JSON.stringify(url)},
      "name": ${JSON.stringify(`Locação de Container em ${c.nome}`)},
      "description": ${JSON.stringify(desc)}
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://phcontainer.com.br/" },
        { "@type": "ListItem", "position": 2, "name": ${JSON.stringify(`Container em ${c.nome}`)}, "item": ${JSON.stringify(url)} }
      ]
    }
    </script>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${url}">

    <meta property="og:type" content="website">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:site_name" content="PH Container">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="https://phcontainer.com.br/bg-container.webp">
    <meta property="og:url" content="${url}">

    <link rel="icon" type="image/webp" href="/logo.webp">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css?v=1.0.2">

    ${ld}
    <style>${CSS}</style>
</head>
<body class="subpage">
    <header class="header">
        <div class="container header-container">
            <div class="logo"><a href="/"><img src="/logo.webp" alt="PH Container" width="150" height="44" style="height:44px;width:auto;transform:translateY(2px)"></a></div>
            <nav class="nav">
                <a href="/#quem-somos">Quem Somos</a>
                <a href="/#servicos">Nossos Serviços</a>
                <a href="/cidades/">Cidades</a>
                <a href="/sobre/">Sobre</a>
                <a href="${WA}" class="btn btn-primary btn-sm" target="_blank" rel="noopener">Solicite um orçamento</a>
            </nav>
            <div class="mobile-menu-btn"><span></span><span></span><span></span></div>
        </div>
    </header>
`;
}

function servicos(nome) {
  return `        <section class="sp-section section-gray">
            <div class="container">
                <div class="sp-lead-h anim">
                    <h2>O que a PH Container entrega em ${nome}</h2>
                    <p>Containers para obra, indústria, comércio e eventos, com caminhão Munck próprio para colocar e retirar no local.</p>
                </div>
                <div class="services-grid">
                    <div class="service-card">
                        <div class="service-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"></path><path d="M8 6v12"></path><path d="M12 6v12"></path><path d="M16 6v12"></path></svg>
                        </div>
                        <h3 class="service-title">Locação de containers</h3>
                        <ul class="service-list">
                            <li>Escritório com ar-condicionado e instalação elétrica</li>
                            <li>Depósito e almoxarifado</li>
                            <li>Banheiro e vestiário para canteiro de obra</li>
                            <li>Plantão de vendas e refeitório</li>
                            <li>Módulos de 6 metros (20 pés) e 12 metros (40 pés)</li>
                        </ul>
                    </div>
                    <div class="service-card">
                        <div class="service-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                        </div>
                        <h3 class="service-title">Caminhão Munck e içamento</h3>
                        <ul class="service-list">
                            <li>Transporte de cargas em geral</li>
                            <li>Operações de carga e descarga</li>
                            <li>Remoção e mudança de máquinas</li>
                            <li>Içamento de painéis, totens e estruturas</li>
                            <li>Içamento com cesto de inspeção veicular</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
`;
}

function vizinhas(c) {
  const mesma = dados.cidades.filter((x) => x.regiao === c.regiao && x.slug !== c.slug);
  const outras = dados.cidades.filter((x) => x.regiao !== c.regiao && x.slug !== c.slug);
  const lista = [...mesma, ...outras].slice(0, 8);
  const pills = lista.map((x) => `<a href="/container-em-${x.slug}/">Container em ${x.nome}</a>`).join("\n                    ");
  return `${pills}\n                    <a href="/cidades/" class="all">Ver todas as cidades</a>`;
}

function corpo(c) {
  const regiaoTxt = REGIAO_TXT[c.regiao] || "no Vale do Paraíba";
  const nota = limpaTraco(c.nota);

  return `    <main>
        <section class="sp-hero">
            <div class="container">
                <p class="sp-crumb"><a href="/">Início</a> &rsaquo; <a href="/cidades/">Cidades</a> &rsaquo; ${c.nome}</p>
                <span class="sp-chip">PH Container atende ${c.nome}</span>
                <h1>Locação de container em ${c.nome}</h1>
                <p class="lead">Container escritório, almoxarifado, banheiro e refeitório, além de caminhão Munck, com entrega em ${c.nome} e região. Mais de 30 anos de Vale do Paraíba, com frota própria.</p>
                <div class="sp-actions">
                    <a href="${WA}" class="btn btn-primary btn-lg" target="_blank" rel="noopener">Solicitar orçamento no WhatsApp</a>
                    <a href="${MAPS}" class="btn btn-ghost btn-lg" target="_blank" rel="noopener">Ver a PH no mapa</a>
                </div>
            </div>
        </section>

        <div class="container">
            <div class="sp-stats anim">
                <div class="sp-stat"><div class="n">1995</div><div class="l">No Vale do Paraíba desde</div></div>
                <div class="sp-stat"><div class="n">+30</div><div class="l">Anos de operação</div></div>
                <div class="sp-stat"><div class="n">Própria</div><div class="l">Frota de caminhão Munck</div></div>
                <div class="sp-stat"><div class="n">${prazoCurto(c)}</div><div class="l">Prazo médio de entrega em ${c.nome}</div></div>
            </div>
        </div>

${servicos(c.nome)}
        <section class="sp-section">
            <div class="container">
                <div class="sp-block anim">
                    <h2>Aluguel de container em ${c.nome}</h2>
                    <p>A PH Container atende ${c.nome}, ${regiaoTxt}, com locação de containers e caminhão Munck para obras, indústrias, comércio e eventos. A operação começou em 1995, a partir de Jacareí, e a entrega e a retirada são feitas com frota própria de guindautos.</p>
                    <p class="muted">${nota}</p>
                    <p>Depois de confirmar o orçamento, a entrega em ${c.nome} leva ${prazoLongo(c)}, conforme o modelo disponível. O local precisa estar nivelado e com acesso livre para o caminhão posicionar o container.</p>
                    <ul class="sp-checks">
                        <li>Frota própria de Munck, sem terceirizar o guindauto</li>
                        <li>Containers de 6 e 12 metros, combináveis conforme o projeto</li>
                        <li>Orçamento no mesmo dia pelo WhatsApp ${TEL}</li>
                        <li>Contratos por diária, mensais ou por período de obra</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="sp-section section-gray">
            <div class="container">
                <div class="sp-lead-h anim">
                    <h2>Perguntas frequentes sobre container em ${c.nome}</h2>
                </div>
                <div class="sp-faq anim">
                    <details><summary>A PH Container entrega container em ${c.nome}?</summary><p>Sim. ${c.nome} faz parte da área de atendimento da PH Container. A entrega e a retirada são feitas com frota própria de caminhão Munck, a partir da sede em Jacareí.</p></details>
                    <details><summary>Quanto custa alugar um container em ${c.nome}?</summary><p>O valor depende do tipo de container, do tempo de locação e do endereço de entrega em ${c.nome}. O orçamento é gratuito e sem compromisso pelo WhatsApp ${TEL}.</p></details>
                    <details><summary>Qual o prazo para entregar em ${c.nome}?</summary><p>Em média ${prazoCurto(c)} úteis após a confirmação do orçamento, conforme a disponibilidade do modelo escolhido.</p></details>
                    <details><summary>Preciso preparar o terreno em ${c.nome}?</summary><p>O local deve estar nivelado e com acesso livre para o caminhão Munck posicionar o container. A equipe orienta sobre o ponto de instalação antes da entrega.</p></details>
                    <details><summary>A PH aluga só o container ou também o Munck?</summary><p>Os dois. Você pode alugar apenas o container, apenas o caminhão Munck para transporte e içamento, ou os dois juntos.</p></details>
                </div>
            </div>
        </section>

        <section class="sp-section">
            <div class="container">
                <div class="sp-lead-h anim">
                    <h2>De onde a PH Container atende ${c.nome}</h2>
                    <p>Sede própria em Jacareí, com atendimento a ${c.nome} e a todas as cidades do Vale do Paraíba, da Serra da Mantiqueira e do Litoral Norte.</p>
                </div>
                <div class="sp-map anim">
                    <iframe src="https://www.google.com/maps?q=PH+Container+Jacarei&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="PH Container, Jacareí"></iframe>
                    <div class="sp-addr">
                        <h3>PH Container</h3>
                        <p>Av. Nicola Capucci, 391<br>Cidade Jardim, Jacareí - SP<br>12320-330</p>
                        <p><a href="tel:+5512997248156">${TEL}</a><br><a href="mailto:contato@phcontainer.com.br">contato@phcontainer.com.br</a></p>
                        <p><a href="${MAPS}" target="_blank" rel="noopener">Abrir no Google Maps</a></p>
                    </div>
                </div>
            </div>
        </section>

        <section class="sp-section section-gray">
            <div class="container">
                <p class="sp-clients anim">Empresas como <strong>Ambev, Cebrace, Heineken, Nestlé, Suzano</strong> e a <strong>Prefeitura de Jacareí</strong> já contrataram a PH Container no Vale do Paraíba.</p>
            </div>
        </section>

        <section class="sp-section">
            <div class="container">
                <div class="cta-banner anim">
                    <div class="cta-content">
                        <h3>Precisa de um container em ${c.nome}?</h3>
                        <p>Fale com a PH Container e receba o orçamento hoje mesmo, sem compromisso.</p>
                    </div>
                    <a href="${WA}" class="btn btn-primary" style="position:relative;z-index:10" target="_blank" rel="noopener">Solicitar orçamento</a>
                </div>
            </div>
        </section>

        <section class="sp-section section-gray">
            <div class="container">
                <div class="sp-block anim">
                    <h2>A PH Container também atende perto de ${c.nome}</h2>
                </div>
                <div class="sp-near anim">
                    ${vizinhas(c)}
                </div>
            </div>
        </section>
    </main>
`;
}

function rodape() {
  return `    <footer class="footer">
        <div class="container footer-container">
            <div class="footer-col">
                <img src="/logo.webp" alt="PH Container" width="164" height="48" style="height:48px;width:auto;margin-bottom:16px">
                <p class="footer-desc">Soluções eficientes e adaptadas às suas necessidades.</p>
            </div>
            <div class="footer-col">
                <h4>Contato</h4>
                <a href="mailto:contato@phcontainer.com.br" class="footer-link">contato@phcontainer.com.br</a>
                <a href="tel:+5512997248156" class="footer-link">${TEL}</a>
            </div>
            <div class="footer-col">
                <h4>Endereço</h4>
                <a href="${MAPS}" class="footer-link" target="_blank" rel="noopener">Av. Nicola Capucci, 391<br>Cidade Jardim, Jacareí - SP<br>12320-330</a>
            </div>
            <div class="footer-col">
                <h4>Redes Sociais</h4>
                <a href="https://www.instagram.com/phcontainer/" class="footer-link" target="_blank" rel="noopener">Instagram: @phcontainer</a>
                <a href="/cidades/" class="footer-link">Cidades atendidas</a>
                <a href="/politica-de-privacidade.html" class="footer-link">Política de Privacidade</a>
            </div>
            <div class="footer-col">
                <h4>Avaliações</h4>
                <a href="${MAPS}" class="footer-link" target="_blank" rel="noopener" data-track="avaliar">Avalie a PH no Google</a>
            </div>
        </div>
        <div class="container footer-bottom">
            <p>&copy; 2026 PH Container. Todos os direitos reservados. Feito por <a href="https://agencias7.com.br" style="text-decoration:underline" target="_blank" rel="noopener">Agência S7</a></p>
        </div>
    </footer>
    <script src="/script.js?v=1.0.1" defer></script>
    <script src="/cookie-consent.js" defer></script>
</body>
</html>
`;
}

function hubCidades() {
  const grupos = Object.keys(REGIAO_NOME).map((r) => {
    const cs = dados.cidades
      .filter((c) => c.regiao === r)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
    if (!cs.length) return "";
    const pills = cs
      .map((c) => `<a href="/container-em-${c.slug}/">${c.nome}</a>`)
      .join("\n                    ");
    return `                <div class="sp-hub-group anim">
                    <h2>${REGIAO_NOME[r]}</h2>
                    <div class="sp-near">
                    ${pills}
                    </div>
                </div>`;
  }).filter(Boolean).join("\n");

  const h = head(
    { nome: "todo o Vale do Paraíba", slug: "" },
    {
      title: "Cidades atendidas | Locação de container no Vale do Paraíba | PH Container",
      desc: `A PH Container entrega container e caminhão Munck em ${dados.cidades.length} cidades do Vale do Paraíba, da Serra da Mantiqueira e do Litoral Norte de São Paulo. Veja a lista completa.`,
      url: "https://phcontainer.com.br/cidades/",
      ld: `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Cidades atendidas pela PH Container",
      "about": { "@id": "https://phcontainer.com.br/#business" },
      "url": "https://phcontainer.com.br/cidades/",
      "inLanguage": "pt-BR"
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://phcontainer.com.br/" },
        { "@type": "ListItem", "position": 2, "name": "Cidades atendidas", "item": "https://phcontainer.com.br/cidades/" }
      ]
    }
    </script>`,
    }
  );

  const body = `    <main>
        <section class="sp-hero">
            <div class="container">
                <p class="sp-crumb"><a href="/">Início</a> &rsaquo; Cidades</p>
                <span class="sp-chip">${dados.cidades.length} cidades atendidas</span>
                <h1>Cidades atendidas pela PH Container</h1>
                <p class="lead">Locação de containers e caminhão Munck em todo o Vale do Paraíba, na Serra da Mantiqueira e no Litoral Norte de São Paulo. Escolha a sua cidade.</p>
                <div class="sp-actions">
                    <a href="${WA}" class="btn btn-primary btn-lg" target="_blank" rel="noopener">Solicitar orçamento no WhatsApp</a>
                </div>
            </div>
        </section>

        <section class="sp-section">
            <div class="container">
${grupos}
            </div>
        </section>

        <section class="sp-section section-gray">
            <div class="container">
                <div class="cta-banner anim">
                    <div class="cta-content">
                        <h3>Não achou a sua cidade?</h3>
                        <p>A PH Container atende toda a região. Fale com a gente e confirme a entrega no seu endereço.</p>
                    </div>
                    <a href="${WA}" class="btn btn-primary" style="position:relative;z-index:10" target="_blank" rel="noopener">Falar no WhatsApp</a>
                </div>
            </div>
        </section>
    </main>
`;
  return h + body + rodape();
}

let feitas = [];
for (const c of dados.cidades) {
  const html = head(c) + corpo(c) + rodape();
  const dir = path.join(ROOT, `container-em-${c.slug}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
  feitas.push(`https://phcontainer.com.br/container-em-${c.slug}/`);
}

const hubDir = path.join(ROOT, "cidades");
fs.mkdirSync(hubDir, { recursive: true });
fs.writeFileSync(path.join(hubDir, "index.html"), hubCidades(), "utf8");

const urls = ["https://phcontainer.com.br/cidades/", ...feitas];
fs.writeFileSync(path.join(__dirname, "urls-cidades.txt"), urls.join("\n") + "\n", "utf8");
console.log(`${feitas.length} páginas de cidade + 1 hub (/cidades/) geradas.`);
console.log("Lista de URLs: _build/urls-cidades.txt");
