# DESIGN.md — Agência S7

Guia visual do site da S7 (agencias7.com.br), do painel e da loja. Qualquer
página nova (loja, painel do cliente, etc.) segue isto aqui.

## Identidade

- **Tom:** agência premium, direta, confiante. Headline em caixa alta, curta.
- **Tema:** escuro sempre. Não existe versão clara.

## Cores

| Token | Valor | Uso |
|---|---|---|
| `bg` | `#0f0f0f` | fundo de todas as páginas |
| `bg-deep` | `#0c0c0c` | sidebar, header fixo, menus |
| `surface` | `white/[0.03]` + `border-white/10` | cards, inputs |
| `text` | `#f4f4f5` | texto principal |
| `text-muted` | `white/50` (secundário), `white/35` (terciário) | legendas, labels |
| `accent` | `#fe0000` | CTA, item ativo, ícones de destaque, seleção de texto |
| `accent-hover` | `#d40000` | hover do botão sólido |
| `glow` | `#fe0000` com `blur-[180–200px]` e `opacity 0.15–0.35` | brilho vermelho no topo da página |
| sucesso / alerta / erro | `emerald-400` / `amber-400` / `#ff5a5a` | estados |

## Tipografia

- **Fonte:** Plus Jakarta Sans (400–800), carregada sem bloquear o render.
- **Hero:** `font-bold tracking-tighter leading-[0.9] uppercase`, 8–16vw.
- **Título de página:** `text-3xl md:text-4xl font-bold tracking-tighter`.
- **Label / eyebrow:** `text-[11px] font-bold uppercase tracking-widest text-white/40–50`.
- **Corpo:** `text-sm` com `text-white/50–70`.

## Componentes

- **Botão CTA do site:** pílula com borda `white/20`, preenchimento vermelho que
  entra da esquerda pra direita no hover (`-translate-x-[105%] → 0`, 500ms).
- **Botão do painel:** pílula `rounded-full`, `text-xs uppercase tracking-widest`;
  sólido vermelho, outline ou ghost.
- **Card:** `rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm`.
- **KPI:** label pequena em caixa alta + ícone num círculo `bg-[#fe0000]/15` +
  número `text-3xl font-bold tracking-tighter` + legenda.
- **Seletor:** nunca `<select>` nativo — usar `components/admin/Select.tsx`
  (lista escura com busca, item ativo em vermelho).
- **Abas:** pílulas dentro de um trilho `rounded-full border-white/10`, ativa em vermelho.
- **Listas "sem bloco":** linhas com `divide-y divide-white/10 border-y`.
- **Links do rodapé:** sublinhado vermelho que cresce da esquerda no hover.

## Layout

- Largura máxima `1400px`, padding `px-6 md:px-12` (site) / `px-5 md:px-10` (painel).
- Mobile first: tudo precisa funcionar em 360px.
- Espaço generoso entre seções (`mb-32 md:mb-48` no site).

## Movimento

- Suave e curto (300–800ms). Nada de animação que atrase conteúdo no celular.
- Páginas novas preferem CSS/Tailwind a framer-motion (peso do bundle).

## Contato padrão

- WhatsApp: `https://wa.me/5513936283974`
- E-mail: `contato.agencias7@outlook.com`
- Instagram: `@s7.sites`
