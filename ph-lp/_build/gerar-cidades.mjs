// gerar-cidades.mjs — gera uma página estática por cidade a partir de _dados/cidades.json
// Uso:  node _build/gerar-cidades.mjs
// Saída: <raiz do ph-lp>/container-em-<slug>/index.html  (+ lista de URLs no console)
// Sem dependências. A home (index.html) NÃO é tocada.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const dados = JSON.parse(fs.readFileSync(path.join(ROOT, "_dados", "cidades.json"), "utf8"));

const WA = "https://wa.me/5512997248156?text=Ol%C3%A1.%20Gostaria%20de%20solicitar%20um%20or%C3%A7amento!";
const MAPS = "https://www.google.com/maps?cid=8205083714264096334";

function prazo(c) {
  if (c.slug === "ilhabela") return "2 a 4 dias úteis (a travessia de balsa a partir de São Sebastião é combinada na hora do orçamento)";
  if (c.regiao === "Litoral Norte") return "2 a 4 dias úteis";
  if (c.onda === 1) return "1 a 2 dias úteis";
  if (c.onda === 2) return "2 a 3 dias úteis";
  return "2 a 4 dias úteis";
}

function head(c) {
  const title = `Locação de Container em ${c.nome} | PH Container`;
  const desc = `Aluguel de container escritório, almoxarifado e sanitário e caminhão Munck em ${c.nome} e região. PH Container: mais de 30 anos no Vale do Paraíba. Orçamento no WhatsApp.`;
  const url = `https://phcontainer.com.br/container-em-${c.slug}/`;
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
    <meta property="og:title" content="Locação de Container em ${c.nome} | PH Container">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="https://phcontainer.com.br/bg-container.webp">
    <meta property="og:url" content="${url}">

    <link rel="icon" type="image/webp" href="/logo.webp">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css?v=1.0.2">

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Locação de container e caminhão Munck",
      "provider": { "@id": "https://phcontainer.com.br/#business" },
      "areaServed": { "@type": "City", "name": "${c.nome}", "containedInPlace": { "@type": "AdministrativeArea", "name": "Vale do Paraíba, SP" } },
      "url": "${url}",
      "name": "Locação de Container em ${c.nome}",
      "description": "${desc}"
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://phcontainer.com.br/" },
        { "@type": "ListItem", "position": 2, "name": "Container em ${c.nome}", "item": "${url}" }
      ]
    }
    </script>
    <style>
      .subpage-hero{background:linear-gradient(rgba(48,48,146,.92),rgba(48,48,146,.92)),url('/bg-container.webp') center/cover no-repeat;color:#fff;padding:130px 0 60px}
      .subpage-hero .breadcrumb{font-size:14px;color:rgba(255,255,255,.75);margin-bottom:18px}
      .subpage-hero .breadcrumb a{color:rgba(255,255,255,.9);text-decoration:none}
      .subpage-hero h1{font-size:clamp(28px,5vw,44px);line-height:1.15;margin:0 0 14px;max-width:22ch}
      .subpage-hero p{font-size:18px;color:rgba(255,255,255,.88);max-width:60ch;margin:0 0 22px}
      .subpage-hero .btn{background:#fff;color:var(--brand-blue)}
      .prose{max-width:720px}
      .prose h2{font-size:24px;margin:40px 0 12px}
      .prose h2:first-child{margin-top:0}
      .prose p{margin:0 0 16px;line-height:1.7}
      .prose ul{margin:0 0 16px;padding-left:22px;line-height:1.8}
      .faq details{border:1px solid var(--border-color,#e5e7eb);border-radius:10px;padding:14px 16px;margin-bottom:10px}
      .faq summary{font-weight:600;cursor:pointer}
      .faq p{margin:10px 0 0}
      .map-embed{width:100%;height:320px;border:0;border-radius:12px;margin-top:8px}
      .cta-final{background:var(--brand-blue-light,rgba(48,48,146,.08));border-radius:14px;padding:26px;margin-top:32px}
      .cta-final h2{margin:0 0 8px}
      .cta-final p{margin:0 0 16px}
    </style>
</head>
<body>
    <header class="header">
        <div class="container header-container">
            <div class="logo"><a href="/"><img src="/logo.webp" alt="PH Container" width="150" height="44" style="height:44px;width:auto;transform:translateY(2px)"></a></div>
            <nav class="nav">
                <a href="/#quem-somos">Quem Somos</a>
                <a href="/#servicos">Nossos Serviços</a>
                <a href="/sobre/">Sobre</a>
                <a href="${WA}" class="btn btn-primary btn-sm" target="_blank" rel="noopener">Solicite um orçamento</a>
            </nav>
            <div class="mobile-menu-btn"><span></span><span></span><span></span></div>
        </div>
    </header>
`;
}

function vizinhas(c) {
  const mesma = dados.cidades.filter((x) => x.regiao === c.regiao && x.slug !== c.slug);
  const outras = dados.cidades.filter((x) => x.regiao !== c.regiao && x.slug !== c.slug);
  const lista = [...mesma, ...outras].slice(0, 6);
  return lista
    .map((x) => `<a href="/container-em-${x.slug}/">Container em ${x.nome}</a>`)
    .join(" &nbsp;·&nbsp; ");
}

function corpo(c) {
  const p = prazo(c);
  const regiaoTxt = {
    "RMVale": "na Região Metropolitana do Vale do Paraíba",
    "Litoral Norte": "no Litoral Norte de São Paulo",
    "Mantiqueira": "na Serra da Mantiqueira",
    "Bragantina": "na divisa com a região Bragantina",
  }[c.regiao] || "no Vale do Paraíba";

  return `    <main>
        <section class="subpage-hero">
            <div class="container">
                <p class="breadcrumb"><a href="/">Início</a> &rsaquo; Container em ${c.nome}</p>
                <h1>Locação de Container em ${c.nome}</h1>
                <p>Container escritório, almoxarifado e sanitário, e caminhão Munck, entregues em ${c.nome} e região pela PH Container — mais de 30 anos no Vale do Paraíba.</p>
                <a href="${WA}" class="btn btn-primary btn-lg" target="_blank" rel="noopener">Solicitar orçamento no WhatsApp</a>
            </div>
        </section>

        <section class="section">
            <div class="container">
                <div class="prose">
                    <h2>Aluguel de container em ${c.nome}</h2>
                    <p>A PH Container atende ${c.nome}, ${regiaoTxt}, com locação de containers e caminhão Munck para obras, indústrias, eventos e comércio. A empresa opera desde 1995 a partir de Jacareí, com frota própria de guindautos para a entrega e a retirada.</p>
                    <p>${c.nota}</p>

                    <h2>Tipos de container disponíveis em ${c.nome}</h2>
                    <ul>
                        <li><strong>Container escritório</strong> — com ar-condicionado, janelas e instalação elétrica. Para escritório de obra, plantão de vendas ou sala de reunião.</li>
                        <li><strong>Container depósito / almoxarifado</strong> — armazenagem segura de materiais, ferramentas e equipamentos.</li>
                        <li><strong>Container banheiro / vestiário</strong> — sanitário para canteiro de obra, com vasos, chuveiros e lavatórios.</li>
                        <li><strong>Container refeitório</strong> e plantão de vendas.</li>
                    </ul>
                    <p>Os módulos têm 6 metros (20 pés) ou 12 metros (40 pés), e podem ser combinados conforme o projeto.</p>

                    <h2>Caminhão Munck e içamento em ${c.nome}</h2>
                    <p>Além dos containers, a PH aluga caminhão Munck (guindauto) em ${c.nome} para transporte de cargas, carga e descarga, remoção de máquinas e içamento de painéis, totens e estruturas.</p>

                    <h2>Prazo de entrega em ${c.nome}</h2>
                    <p>O prazo típico de entrega em ${c.nome} é de <strong>${p}</strong> após a confirmação do orçamento, conforme a disponibilidade do modelo.</p>

                    <div class="faq">
                        <h2>Perguntas frequentes — ${c.nome}</h2>
                        <details><summary>A PH Container entrega container em ${c.nome}?</summary><p>Sim. ${c.nome} está na área de atendimento da PH Container, com entrega e retirada feitas por frota própria de caminhão Munck.</p></details>
                        <details><summary>Quanto custa alugar um container em ${c.nome}?</summary><p>O valor depende do tipo de container, do tempo de locação e do local de entrega em ${c.nome}. O orçamento é gratuito e sem compromisso pelo WhatsApp (12) 99724-8156.</p></details>
                        <details><summary>Preciso preparar o terreno em ${c.nome}?</summary><p>O local deve estar nivelado e com acesso livre para o caminhão Munck posicionar o container. A equipe orienta sobre o ponto de instalação antes da entrega.</p></details>
                    </div>

                    <h2>Empresas que confiam na PH Container</h2>
                    <p>Ambev, Cebrace, Heineken, Nestlé, Prefeitura de Jacareí, SAAE e Suzano Celulose já contrataram a PH Container no Vale do Paraíba.</p>

                    <h2>Onde estamos</h2>
                    <p>Sede em Jacareí — Av. Nicola Capucci, 391, Cidade Jardim, Jacareí - SP. Atendimento a ${c.nome} e a todas as cidades do Vale do Paraíba, Serra da Mantiqueira e Litoral Norte.</p>
                    <iframe class="map-embed" src="https://www.google.com/maps?q=PH+Container+Jacarei&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="PH Container - Jacareí"></iframe>

                    <div class="cta-final">
                        <h2>Precisa de um container em ${c.nome}?</h2>
                        <p>Fale com a PH Container e receba o orçamento hoje mesmo.</p>
                        <a href="${WA}" class="btn btn-primary" target="_blank" rel="noopener">Solicitar orçamento no WhatsApp</a>
                    </div>

                    <h2>PH Container também atende perto de ${c.nome}</h2>
                    <p style="line-height:2">${vizinhas(c)} &nbsp;·&nbsp; <a href="/cidades/">ver todas as cidades</a></p>
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
                <a href="tel:+5512997248156" class="footer-link">(12) 99724-8156</a>
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
                <a href="${MAPS}" class="footer-link" target="_blank" rel="noopener" data-track="avaliar">★ Avalie a PH no Google</a>
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
  const regioes = {
    "RMVale": "Região Metropolitana do Vale do Paraíba",
    "Litoral Norte": "Litoral Norte de São Paulo",
    "Mantiqueira": "Serra da Mantiqueira",
    "Bragantina": "Região Bragantina",
  };
  const grupos = Object.keys(regioes).map((r) => {
    const cs = dados.cidades.filter((c) => c.regiao === r).sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
    if (!cs.length) return "";
    const itens = cs.map((c) => `<li><a href="/container-em-${c.slug}/">Locação de container em ${c.nome}</a></li>`).join("\n                        ");
    return `                    <h2>${regioes[r]}</h2>\n                    <ul class="cidades-hub">\n                        ${itens}\n                    </ul>`;
  }).filter(Boolean).join("\n\n");

  const fake = { nome: "todas as cidades", slug: "", regiao: "RMVale", nota: "", onda: 1 };
  const h = head({ ...fake, nome: "todo o Vale do Paraíba" })
    .replace("<title>Locação de Container em todo o Vale do Paraíba | PH Container</title>",
             "<title>Cidades atendidas | Locação de Container no Vale do Paraíba | PH Container</title>")
    .replace(/<link rel="canonical"[^>]*>/, '<link rel="canonical" href="https://phcontainer.com.br/cidades/">')
    .replace(/"url": "https:\/\/phcontainer\.com\.br\/container-em-\/"/g, '"url": "https://phcontainer.com.br/cidades/"');

  const body = `    <main>
        <section class="subpage-hero">
            <div class="container">
                <p class="breadcrumb"><a href="/">Início</a> &rsaquo; Cidades atendidas</p>
                <h1>Cidades atendidas pela PH Container</h1>
                <p>Locação de containers e caminhão Munck em ${dados.cidades.length} cidades do Vale do Paraíba, da Serra da Mantiqueira e do Litoral Norte de São Paulo.</p>
                <a href="${WA}" class="btn btn-primary btn-lg" target="_blank" rel="noopener">Solicitar orçamento no WhatsApp</a>
            </div>
        </section>
        <section class="section">
            <div class="container">
                <div class="prose">
${grupos}
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

// grava a lista de URLs para o sitemap (hub + cidades)
const urls = ["https://phcontainer.com.br/cidades/", ...feitas];
fs.writeFileSync(path.join(__dirname, "urls-cidades.txt"), urls.join("\n") + "\n", "utf8");
console.log(`${feitas.length} páginas de cidade + 1 hub (/cidades/) geradas.`);
console.log("Lista de URLs: _build/urls-cidades.txt");
