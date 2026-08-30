# Checklist técnico + SEO — Agência S7

Use este arquivo em todo site novo da agência, do início ao lançamento. Copie a seção "Checklist rápido" pro início de cada projeto e vá marcando.

---

## 1. Arquivos técnicos obrigatórios (raiz do site)

- **favicon** — o ícone que aparece na aba do navegador, nos favoritos e na busca do Google. Sem ele o site parece amador e o Google usa um ícone genérico nos resultados. Formatos: `.svg` ou `.png` 32x32/180x180 (para iOS use `apple-touch-icon`).
- **robots.txt** — arquivo na raiz (`seudominio.com/robots.txt`) que diz aos buscadores o que podem rastrear e onde está o sitemap. Sem ele, nada quebra, mas você perde a chance de apontar o sitemap direto pro Google.
- **sitemap.xml** — lista de todas as URLs do site com data da última atualização. Ajuda o Google a descobrir e indexar páginas mais rápido, principalmente em sites novos sem muitos links externos ainda.
- **llms.txt** — arquivo (padrão novo, `llmstxt.org`) com um resumo do site em markdown, pensado para IAs/LLMs (ChatGPT, Perplexity, Claude etc.) entenderem do que se trata o negócio sem precisar processar o HTML inteiro. Ainda não é usado pelo Google, mas é usado por buscadores de IA — tende a crescer em importância.
- **.htaccess** (hospedagem Apache, caso da Hostinger) — arquivo de configuração do servidor. É onde ficam: redirecionamento HTTPS, compressão GZIP, cache do navegador, headers de segurança e a página de erro 404 customizada.

## 2. Título, meta description e afins (em cada página)

- **`<title>`** — aparece na aba do navegador e como link clicável no Google. Ideal: 50–60 caracteres, com a palavra-chave principal + nome da marca.
- **meta description** — o resumo em cinza abaixo do título nos resultados do Google. Não é fator direto de ranqueamento, mas afeta diretamente a taxa de clique (CTR). Ideal: 140–160 caracteres, com um motivo pra clicar (benefício, chamada pra ação).
- **meta keywords** — hoje ignorada pelo Google (não afeta ranking), mas ainda vale colocar por organização interna e porque outros buscadores/IAs por vezes ainda leem.
- **canonical** (`<link rel="canonical">`) — diz ao Google qual é a URL "oficial" da página, evitando problema de conteúdo duplicado (ex: `site.com` vs `site.com/index.html` vs `www.site.com`).
- **lang** (`<html lang="pt-BR">`) — informa o idioma da página; ajuda o Google a mostrar o site pra buscas em português.
- **Hierarquia de headings** — só um `<h1>` por página (o título principal), e `<h2>`/`<h3>` organizando as seções em ordem lógica. Ajuda o Google a entender a estrutura do conteúdo.
- **Alt text nas imagens** (`alt="..."`) — descrição da imagem para leitores de tela e para o Google Imagens. Toda imagem que carrega informação (não decorativa) precisa de alt descritivo com palavra-chave quando fizer sentido.

## 3. Imagem OG (Open Graph)

Define como o link aparece quando compartilhado no WhatsApp, Instagram, Facebook, LinkedIn etc. (`og:title`, `og:description`, `og:image`, `og:url`). Sem isso, o link aparece "pelado", sem preview — prejudica muito o clique quando o link é compartilhado.

- Tamanho ideal da imagem: **1200x630px**, formato `.jpg`/`.webp`, com o logo/nome da marca visível mesmo em miniatura.
- Testar sempre depois de publicar: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) e a prévia de link do WhatsApp Web.

## 4. HTTPS e segurança do domínio

- **Certificado SSL/HTTPS** — obrigatório hoje em dia; sem ele o navegador marca o site como "Não seguro" e o Google penaliza no ranking. Na Hostinger, o SSL grátis (Let's Encrypt) normalmente é emitido automático ao apontar o domínio — confirme em hPanel → Sites → SSL que está **ativo**.
- **Forçar redirecionamento HTTP → HTTPS** — feito via `.htaccess` (já configurado nos dois sites).
- **HSTS (Strict-Transport-Security)** — header que diz ao navegador "sempre acesse este site por HTTPS, nunca tente por HTTP", mesmo que o usuário digite sem `https://`. Protege contra ataques de downgrade. Já adicionado no `.htaccess` dos dois sites.
- **DNSSEC** — assinatura criptográfica da zona DNS que impede que alguém falsifique as respostas de DNS do seu domínio (DNS spoofing/cache poisoning). No Registro.br, ative em "Meus domínios" → domínio → **DNSSEC**. É opcional, mas recomendado para domínios de empresas — uma vez só, não precisa mexer depois.
- **CAA record** — registro DNS que restringe quais Autoridades Certificadoras podem emitir certificado SSL pro seu domínio (evita que certificado seja emitido por engano/fraude para outra empresa em seu nome). Ex.: `phcontainer.com.br. CAA 0 issue "letsencrypt.org"`.
- **Headers de segurança** (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) — já configurados no `.htaccess`. Protegem contra clickjacking, MIME-sniffing e vazamento de referrer.
- **WHOIS privado** — verifique se o registro do domínio esconde seus dados pessoais (nome, telefone, endereço) da consulta pública do WHOIS. No Registro.br isso é automático para pessoa física/CPF.
- **Backups automáticos** — confirme no hPanel se o backup automático do site/banco está ativado (Hostinger costuma oferecer backup diário/semanal dependendo do plano).

## 5. Página 404 customizada

Página que aparece quando alguém acessa uma URL que não existe (link quebrado, digitação errada). Sem ela, o visitante vê a página de erro genérica do servidor e sai do site. Uma 404 com a cara da marca + botão pra voltar ao início retém parte desse tráfego. Configurada via `ErrorDocument 404 /404.html` no `.htaccess`.

## 6. Compressão/otimização de imagens

Imagens pesadas são a causa nº 1 de site lento. Regras:
- Prefira **`.webp`** (ou `.avif`) ao invés de `.jpg`/`.png` — mesmo qualidade visual, 30–80% menor.
- Nunca subir imagem maior do que o tamanho que ela vai ocupar na tela (ex: não usar uma foto de 4000px de largura pra exibir em um card de 400px).
- `loading="lazy"` em toda imagem abaixo da dobra (fora da primeira tela) — o navegador só carrega quando o usuário rola até ela.
- A imagem principal do topo (hero/LCP) deve ser a única com prioridade alta (`fetchpriority="high"` / `preload`) — só uma por página, senão elas competem entre si e pioram a métrica.
- Delete sempre imagens duplicadas/não usadas antes de subir pro servidor (menos peso no upload e no backup).

## 7. Política de Privacidade e cookies (LGPD)

Qualquer site que colete dado (formulário de contato, WhatsApp, ou só analytics/cookies) precisa, pela LGPD (Lei 13.709/2018):
- Uma página de **Política de Privacidade** explicando: quais dados são coletados, pra que servem, com quem são compartilhados (ex: Google Analytics), e como a pessoa pode pedir acesso/exclusão dos dados.
- Um **aviso/banner de cookies** com opção de aceitar ou recusar, linkando pra política.
- Link da política visível no rodapé de todas as páginas.

## 8. Analytics e ferramentas de rastreamento

- **Google Analytics 4 (GA4)** — mede visitantes, origem do tráfego, páginas mais vistas, conversões (cliques no WhatsApp, envio de formulário etc.). Sem isso você não sabe o que está funcionando no site.
  - Criar propriedade em [analytics.google.com](https://analytics.google.com) → pegar o **Measurement ID** (`G-XXXXXXXXXX`) → colar no arquivo `cookie-consent.js` de cada site (linha `GA_MEASUREMENT_ID`).
- **Google Search Console** — mostra como o Google enxerga o site: erros de indexação, palavras-chave que trazem cliques, posição média, sitemap enviado. Cadastro obrigatório pra qualquer site sério.
- **Google Tag Manager (GTM)** (opcional, recomendado a partir de sites com formulário/conversão) — permite adicionar/gerenciar pixels e tags (Analytics, Meta Ads, Google Ads) sem editar código toda vez.
- **Bing Webmaster Tools** — mesma ideia do Search Console, mas pro Bing/Yahoo. Rápido de cadastrar (importa direto do Search Console) e traz uma fatia extra de tráfego de graça.
- **Conversões configuradas no GA4** — marcar como "evento de conversão" ações como clique no botão do WhatsApp, envio de formulário, clique no telefone. Sem isso, analytics vira só "número de visita", sem mostrar o que gera resultado de verdade.

## 9. E-mail: SPF, DKIM e DMARC

São 3 registros de **DNS** (não são arquivo de código) que autenticam os e-mails enviados pelo domínio da empresa (ex: `contato@phcontainer.com.br`) e evitam que:
1. Seus e-mails caiam em spam;
2. Alguém falsifique um remetente `@seudominio.com.br` pra aplicar golpe/phishing em nome da empresa.

- **SPF** (Sender Policy Framework) — lista quais servidores têm permissão pra enviar e-mail em nome do domínio. Registro TXT, ex: `v=spf1 include:_spf.hostinger.com ~all` (o valor exato depende de qual serviço de e-mail está sendo usado — Hostinger Email, Google Workspace, Zoho etc.).
- **DKIM** (DomainKeys Identified Mail) — assinatura criptográfica que comprova que o e-mail realmente saiu do servidor autorizado e não foi alterado no caminho. O provedor de e-mail gera essa chave; você só cola o registro TXT no DNS.
- **DMARC** (Domain-based Message Authentication) — diz o que fazer com e-mails que falharem SPF/DKIM (rejeitar, quarentena ou só monitorar) e pra onde mandar relatório. Registro TXT em `_dmarc.seudominio.com.br`, ex: `v=DMARC1; p=quarantine; rua=mailto:contato@seudominio.com.br`.

**Onde configurar:** dentro do painel de e-mail que a empresa usa (hPanel → E-mails, se for e-mail da Hostinger; ou Google Workspace/Zoho, se for outro provedor). Cada provedor de e-mail gera os valores exatos — precisa copiar de lá e colar no DNS do domínio (Registro.br ou hPanel, dependendo de onde a zona DNS está).
⚠️ **Nota**: o `s7-lp` atualmente usa `contato.agencias7@outlook.com` (e-mail no domínio da Microsoft, não em `agencias7.com.br`) — SPF/DKIM/DMARC só fazem sentido se a agência migrar pra um e-mail `@agencias7.com.br` de verdade.

## 10. Google Meu Negócio (Perfil da Empresa no Google)

Essencial pra qualquer negócio com atendimento local (mostra no Google Maps, na busca local, permite avaliações). Pra cada site novo da agência:
- Confirmar se o cliente já tem o perfil criado e verificado ([google.com/business](https://business.google.com)).
- Categoria certa, endereço, telefone, horário de funcionamento e site preenchidos e **idênticos** aos do rodapé do site (NAP consistency — Nome, Endereço, Phone iguais em todo lugar ajuda o SEO local).
- Fotos reais do local/equipe/trabalho (perfis com fotos aparecem muito mais nas buscas locais).
- Link de **avaliação direta** (`g.page/r/.../review`) — pegue em "Peça avaliações" dentro do próprio perfil do Google — e coloque um botão "Avalie-nos no Google" no site.

**Status atual:**
- `ph-lp` (PH Container): já tem o mapa embutido e o link de endereço apontando pro perfil do Google (via `cid`), mas ainda não tem um botão direto de "avalie-nos". Assim que vocês pegarem o link de avaliação no painel do Google Meu Negócio, é só me passar que eu coloco no site.
- `s7-lp` (Agência S7): não tem embed de mapa nem menção a Google Meu Negócio — se a agência tiver (ou quiser criar) um perfil, vale adicionar, até como prova social ("nós mesmos usamos o que vendemos").

## 11. PageSpeed / Core Web Vitals

Ferramenta do Google ([pagespeed.web.dev](https://pagespeed.web.dev)) que dá uma nota de 0–100 pra performance, acessibilidade, boas práticas e SEO técnico — e a velocidade **é** fator de ranqueamento oficial do Google (mobile principalmente). Rode o teste assim que o site estiver publicado (localhost não conta).

As 3 métricas que mais importam (Core Web Vitals):
- **LCP** (Largest Contentful Paint) — tempo até o maior elemento visível (geralmente a imagem/hero) aparecer. Meta: < 2,5s. É por isso que só a imagem do hero deve ter `fetchpriority="high"`.
- **CLS** (Cumulative Layout Shift) — o quanto os elementos "pulam" de lugar enquanto a página carrega (ex: imagem sem tamanho definido empurra o texto). Meta: < 0,1. Sempre definir `width`/`height` (ou `aspect-ratio`) nas imagens.
- **INP** (Interaction to Next Paint) — tempo de resposta depois de um clique/toque. Meta: < 200ms. JS pesado/bloqueante (ex: bibliotecas de animação grandes) piora essa métrica.

O que já ajuda nos dois sites (feito): imagens em `.webp`, `loading="lazy"` fora da dobra, compressão GZIP, cache do navegador via `.htaccess`, só uma imagem com prioridade alta por página.
O que ainda pode ganhar pontos, caso o PageSpeed acuse:
- Minificar CSS/JS (o `ph-lp`, por ser HTML puro, não passa por build — dá pra minificar manualmente ou com uma ferramenta antes de subir).
- Converter as fotos de parceiros do `ph-lp` (`.jpg`) pra `.webp` também.
- Adicionar `width`/`height` explícitos em toda tag `<img>` que ainda não tiver, pra eliminar CLS.
- Evitar carregar bibliotecas JS pesadas (ex: `framer-motion` no `s7-lp`) em página que não precisa de tanta animação.

## 12. SEO on-page avançado (o que faz o site subir no ranking)

- **Dados estruturados / Schema.org (JSON-LD)** — um bloco de código invisível que descreve pro Google, de forma estruturada, o que é a página: `LocalBusiness` (negócio local, com endereço/telefone/horário), `Organization`, `FAQPage`, `BreadcrumbList`, `Review`. Isso é o que faz aparecer estrela de avaliação, horário de funcionamento e outros "resultados ricos" direto na busca — aumenta muito o CTR. Recomendo fortemente adicionar `LocalBusiness` no `ph-lp` (tem endereço físico e horário) em todo site novo com endereço físico.
- **Consistência NAP** (Nome, Endereço, Telefone) — devem ser **idênticos**, caractere por caractere, no site, no Google Meu Negócio e em qualquer diretório (Yelp, listas locais, etc.). Inconsistência confunde o algoritmo de SEO local.
- **Palavras-chave** — não é só colocar na meta tag; a palavra-chave principal deve aparecer naturalmente no `<h1>`, no primeiro parágrafo, em pelo menos um `<h2>`, e no `alt` de alguma imagem. Sem forçar (keyword stuffing derruba ranking).
- **Conteúdo fresco** — sites que nunca mudam tendem a estagnar no ranking. Um blog ou seção de "novidades"/"projetos recentes" atualizada periodicamente ajuda o Google a rastrear o site com mais frequência.
- **Link interno** — linkar entre seções/páginas do próprio site (já feito via âncoras `#quem-somos`, `#servicos` etc.) ajuda o Google a entender a estrutura e distribuir "autoridade" entre as páginas.
- **Backlinks** (links de outros sites apontando pro seu) — o fator de ranking mais forte a longo prazo. Formas simples de conseguir: diretórios de empresas locais, parceiros/fornecedores linkando de volta, imprensa local, o próprio rodapé "Feito por Agência S7" linkando pro site do cliente (e vice-versa) já ajuda os dois lados.
- **URL limpa** — evitar parâmetros estranhos (`?id=123&ref=xyz`); preferir `/servicos` a `/pagina.php?id=4`.
- **Mobile-first** — o Google indexa a versão mobile do site primeiro. Testar sempre no celular de verdade, não só redimensionando o navegador.
- **Velocidade do servidor** — plano de hospedagem compatível com o tráfego esperado; hospedagem lenta derruba todas as métricas acima independente do código.

---

## Checklist rápido de lançamento (copiar em todo projeto novo)

**Arquivos e configuração**
- [ ] favicon
- [ ] robots.txt
- [ ] sitemap.xml
- [ ] llms.txt
- [ ] .htaccess (HTTPS forçado, GZIP, cache, headers de segurança, HSTS, 404)

**Cada página**
- [ ] `<title>` único e otimizado (50–60 caracteres)
- [ ] meta description (140–160 caracteres)
- [ ] meta keywords
- [ ] canonical
- [ ] `lang="pt-BR"`
- [ ] um único `<h1>`, hierarquia de headings correta
- [ ] alt text em todas as imagens
- [ ] imagem OG (1200x630) + og:title/description/url

**Segurança**
- [ ] SSL ativo (cadeado no navegador)
- [ ] HTTPS forçado
- [ ] HSTS
- [ ] DNSSEC ativado no domínio
- [ ] CAA record (opcional)
- [ ] WHOIS privado
- [ ] Backup automático ativo

**Páginas obrigatórias**
- [ ] 404 customizada
- [ ] Política de Privacidade + banner de cookies

**Rastreamento**
- [ ] Google Search Console (propriedade verificada + sitemap enviado)
- [ ] Google Analytics 4 instalado
- [ ] Bing Webmaster Tools

**E-mail**
- [ ] SPF configurado
- [ ] DKIM configurado
- [ ] DMARC configurado

**Local / Google Meu Negócio**
- [ ] Perfil criado e verificado
- [ ] NAP (nome/endereço/telefone) igual em todo lugar
- [ ] Fotos adicionadas
- [ ] Link de avaliação no site

**Performance**
- [ ] Imagens em `.webp`, comprimidas
- [ ] `loading="lazy"` fora da dobra
- [ ] Teste no PageSpeed Insights (nota mobile e desktop)
- [ ] LCP < 2,5s / CLS < 0,1 / INP < 200ms

**SEO avançado**
- [ ] Dados estruturados (Schema.org / JSON-LD)
- [ ] Palavra-chave principal no H1, primeiro parágrafo e um H2
- [ ] Link interno entre seções/páginas
- [ ] Backlinks (diretórios, parceiros, imprensa local)
