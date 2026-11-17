# Site PH Container (v2)

Novo site da PH Container (phcontainer.com.br), adaptado do template Code Makers de climatização
(Next.js 16 + Tailwind 4) com identidade própria. Substitui o `../ph-lp` (HTML puro) mantendo
**as mesmas URLs**, JSON-LD, `llms.txt`, `robots.txt` e o script de GA4/conversões.

## Rodar e publicar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera a pasta out/ (site 100% estático)
```

**Deploy na Hostinger:** subir **todo o conteúdo de `out/`** para `public_html`, incluindo o `.htaccess`
(arquivo oculto). Apagar antes os arquivos antigos que não existem mais (`styles.css`, `script.js`,
`partners/`, `politica-de-privacidade.html`). O `.htaccess` redireciona o endereço antigo da política.

## Onde editar

| O quê | Arquivo |
| --- | --- |
| Telefone, WhatsApp, e-mail, endereço, horário, clientes, fotos | `lib/site-config.ts` |
| Cidades (39 páginas `/container-em-<slug>/`) | `lib/cidades.json` |
| Perguntas frequentes (texto + schema FAQPage) | `lib/faq.ts` |
| Hero desktop / mobile | `app/page.tsx` / `components/mobile-hero.tsx` |
| Seções da home | `components/site-sections.tsx` |
| Página de cidade | `app/[cidade]/page.tsx` |
| Cores e identidade (índigo + âmbar, fita zebrada, chapa corrugada) | `app/ph.css`, `app/subpage.css` |
| SEO global e schema LocalBusiness | `app/layout.tsx`, `components/json-ld.tsx` |
| GA4 (ID `G-XXXXXXXXXX`) | `public/cookie-consent.js` |

## Diferenças em relação ao site da Luchetti (mesmo template)

Paleta índigo/âmbar (Luchetti é verde/vermelho), títulos em Archivo condensado, fitas do hero mantidas
como "fita de sinalização", seções próprias (faixa de clientes, medidas 6 m/12 m com desenho técnico,
"Quem somos" em colagem, "Como funciona" em 4 passos, cidades atendidas) e rodapé em ficha de contato.

## Pendências

- **Fotos:** as de `public/fotos/` são ilustrativas (IA, Canva). Trocar por fotos reais da PH mantendo
  nome e proporção (hero 16:9, cards 4:3, galeria 3:4). `bg-container.webp` é a única foto real.
- Confirmar horário real (`site.hours` + `openingHoursSpecification` em `components/json-ld.tsx`).
- Link curto de avaliação do Google (`site.reviewUrl`).
- ID do GA4 em `public/cookie-consent.js`.
