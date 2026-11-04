# Aquisição da Agência S7: funil + anúncios (plano condicional, 2026-11-04)

Status: **rascunho**. É um plano condicional, feito com code-funnel-builder e code-ads (Code Makers). Nada aqui é previsão de resultado.
Rótulos usados: **[confirmado]** = está no site/código · **[assunção]** = falta validar · **[bloqueio]** = sem isso não dá para decidir.

## 1. Fatos e lacunas
| Campo | Status | Decisão afetada |
|---|---|---|
| Serviços: criação de sites, SEO, Google Meu Negócio | [confirmado] landing | oferta e grupos de anúncio |
| Contato: WhatsApp +55 13 93628-3974 | [confirmado] | canal de conversão |
| Região atendida | [assunção] Baixada Santista, pelo DDD 13. **Confirmar cidades** | segmentação geográfica |
| Ticket médio por serviço e margem | **[bloqueio]** | CPA máximo, orçamento |
| Taxa conversa → proposta → venda | **[bloqueio]** (medir pelo painel /admin/vendas) | CPL máximo |
| Capacidade de projetos por mês | **[bloqueio]** | teto de escala |
| Prova social | [confirmado] 1 depoimento (PH Container). "99% satisfação", "1º no Google Local" e "50+ serviços" **sem fonte** | não usar em anúncio até ter fonte |

Fórmulas, para quando houver os dados: contribuição por projeto = ticket − custos variáveis; **CPA-alvo = contribuição − lucro mínimo**; **CPL máximo = taxa conversa→venda × CPA-alvo**.

## 2. Funil (máquina de estados)
| Estado | Entrada | Evento / ID | Saída | Exceção |
|---|---|---|---|---|
| Visita | anúncio/orgânico com UTM | page_view | clique no WhatsApp | página lenta ou quebrada |
| Clique WhatsApp | CTA header, hero ou final | `whatsapp_click` + `cta_location` (dataLayer) **[pronto]** | conversa | WhatsApp não instalado (desktop abre web) |
| Conversa | mensagem pré-preenchida diz a origem **[pronto]** | registrar no CRM/planilha | qualificado | fora da região → responder com honestidade e encerrar |
| Qualificado | precisa de site/SEO/GMN, tem orçamento | — | proposta | sem orçamento → nutrir sem insistência |
| Proposta | reunião ou briefing | — | venda / perda (com motivo) | follow-up limitado (máx. 2) |
| Venda | contrato assinado | linha em `sales` (painel) | onboarding | — |

O que falta no funil: guardar a origem da conversa (header/hero/final e, se houver, a UTM) junto da venda em `sales`, para medir o custo por venda e não só por clique.

## 3. Google Ads Search (primeiro canal, por ser intenção explícita)
Pré-requisitos: [bloqueio] GTM/GA4 ou Google tag instalado, conversão = `whatsapp_click`, QA de ponta a ponta.

- **Campanha** `GADS | SEARCH | SITES | <região> | 2026-11`. Objetivo: lead (clique no WhatsApp) → venda.
- **Grupo 1, criação de sites** (transacional). Exemplos de busca: "criação de sites [cidade]", "fazer site para empresa [cidade]".
- **Grupo 2, Google Meu Negócio** (só se houver página/âncora própria explicando o serviço).
- **Negativas iniciais** (revisar com os termos de busca reais antes): curso, grátis, emprego, vaga, template, wix, tutorial, como fazer.
- **Títulos (RSA)**, só fatos do site: "Criação de Sites", "Sites para Empresas", "SEO e Google Meu Negócio", "Fale no WhatsApp", "Orçamento pelo WhatsApp", "Agência S7", "Site Rápido no Celular", "Apareça no Google", "Veja Nosso Último Projeto", "Atendimento em <cidade>" [assunção].
- **Descrições**: "Sites, SEO e Google Meu Negócio para empresas que querem ser encontradas no Google." · "Fale com a Agência S7 pelo WhatsApp e peça seu orçamento."
- **Não usar**: "nº1", "99% de satisfação", "garantido", até existir fonte.

## 4. Meta Ads (depois de validar o Search)
Hipótese H01 "ver o processo reduz incerteza": vídeo vertical de 15–20 s mostrando o site da PH Container no celular, já entregue e real. O destino é a landing; o CTA leva ao WhatsApp. Precisa de pixel + CAPI com dedup por `event_id`, o que é [bloqueio].

## 5. Plano 7/14/30 dias (depois dos bloqueios)
- **7 dias**: instalar a tag e testar `whatsapp_click` com UTM em celular; registrar as 10 primeiras conversas com a origem.
- **14 dias**: ler os termos de busca (escalar / manter / negativar); medir conversa → qualificado.
- **30 dias**: comparar custo por venda com o CPA-alvo e decidir entre manter, ajustar ou pausar. Com poucas vendas, o sinal é só direcional.

## Para o Felipe responder (desbloqueia o plano)
1. Em que cidades vocês atendem?
2. Ticket médio de site, de SEO e de GMN, e quanto sobra de cada um (margem)?
3. Quantos projetos novos por mês a equipe aguenta?
4. Os números "99% de satisfação", "1º no Google Local" e "50+ serviços" têm fonte? Se não tiverem, tiro do site.
5. Orçamento mensal de mídia que dá para testar?
