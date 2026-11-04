# Site Luchetti — Hidráulica e Impermeabilização

Site institucional da Luchetti (São José dos Campos/SP, desde 1941), adaptado do template Code Makers (Next.js 16 + Tailwind 4).

## Rodar local

Requer Node.js 22.13+.

```bash
npm ci
npm run dev      # http://localhost:3000
npm run build    # build de produção
```

## Onde editar

| O quê | Arquivo |
| --- | --- |
| Telefone, WhatsApp, e-mail, endereço, redes, marcas | `lib/site-config.ts` |
| Cores e logo | `app/brand.css`, `public/logo-luchetti-*.svg` |
| Fotos (caminhos) | `lib/site-config.ts` → `photos` |
| Hero (desktop) | `app/page.tsx` |
| Hero (mobile) | `components/mobile-hero.tsx` |
| Linhas de produto, "Quem atendemos", rodapé | `components/site-sections.tsx` |
| Perguntas frequentes | `components/faq-section.tsx` |
| Menu | `components/owner-navigation.tsx` |
| SEO (title, description, Open Graph, schema LocalBusiness) | `app/layout.tsx` |

## Identidade visual (extraída de luchetti.com.br)

- **Logo:** `public/logo-luchetti-verde.svg` (fundo claro) e `public/logo-luchetti-branco.svg` (fundo escuro). O wordmark e a faixa vermelha são os vetores originais do site; a linha "Hidráulica & Impermeabilização" foi redesenhada em vetor limpo (no original ela é um bitmap vetorizado, serrilhado).
- **Cores:** verde da marca `#0B6B2D`, verde-petróleo `#00342B`, verde vivo `#009640`, vermelho `#ED1C24` (acentos), menta `#F4FFF9`. Variáveis em `app/brand.css`; a paleta inteira do template foi convertida de azul para verde.
- **Fontes:** Poppins (títulos) e Open Sans (texto), as mesmas do site atual.

## Pendências antes de publicar

1. **Horário da loja:** preencher `site.storeHours` em `lib/site-config.ts` (ex.: `'Seg a sex, 7h às 17h · Sáb, 7h às 12h'`). Não aparece no site atual.
2. **Fotos:** as 10 fotos em `public/fotos/` são ilustrativas, geradas por IA no Canva. Não mostram a loja nem a equipe reais. Dá pra publicar com elas, mas vale trocar o hero (`hero-loja.jpg`) e a fachada (`footer-panorama.jpg`) por fotos reais da Luchetti assim que possível, mantendo os nomes e as proporções (hero 16:9, fachada 5:2, linhas 4:3, obras 4:5).

O site já vem indexável (`robots: index`). Para uma versão de homologação, troque para `index: false` em `app/layout.tsx`.
