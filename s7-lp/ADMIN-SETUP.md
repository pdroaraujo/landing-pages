# Painel Adm — Agência S7 (`/admin`)

Área administrativa adicionada ao `s7-lp`: **Dashboard**, **Prospecção**
(Encontrar Clientes · Scanner Local · Roleta) e **Listas** de ligação, com login.

- Stack: Vite + React 19 + Tailwind v4 + react-router (front) · **Supabase**
  (Auth + Postgres + Edge Function) · Apify (Google Maps) · Gemini (análise de site).
- Rotas: `/` (LP pública, intacta), `/login`, `/admin/*` (protegida).
- Design: mesmo padrão S7 — fundo `#0f0f0f`, vermelho `#fe0000`, Plus Jakarta Sans.

## Estado (2026-09-01) — no ar e testado

- Projeto Supabase `projeto-s7` (`qzjjyyzhypnybhswwmnm`) · schema aplicado · função
  `prospect` publicada com secrets.
- Logins criados: **pedro@agencias7.com.br** (admin), **antonio@** e **vinicius@**
  (sócios). Senha inicial `S7-<nome>-troque123` — trocar no 1º acesso.
- Fluxo testado ponta a ponta: Apify puxou 10 salões/barbearias em Praia Grande com
  telefone, classificou lead/instagram/linktree/site-próprio e o Gemini deu pareceres
  reais ("site com erro 404", "SSL fora do ar", etc). Divisão em rodízio OK (5/3/3).

**Observações de operação:**
- **Apify demora ~2 min por rodada** (cold start do scraper), independente do tamanho.
  Para 100 leads/dia, rode 3–4 buscas menores (nichos/cidades diferentes) em vez de
  uma gigante. `maxResults` é limitado a 60 quando a fonte é Apify.
- **OpenStreetMap é grátis mas raso no Brasil** — costuma trazer poucas empresas.
  Serve para testar sem custo; para volume real, use a fonte Google (Apify).

---

## 1. Supabase

1. Crie um projeto em https://supabase.com (região **South America (São Paulo)**).
2. **SQL Editor** → cole e rode `supabase/schema.sql`.
3. **Project Settings → API**: copie `Project URL` e a chave `anon public`.
4. **Onde pegar as chaves** — no painel do projeto, menu lateral **Project Settings**
   (engrenagem) → **API Keys**:
   - `anon` / `public` (também chamada "publishable") → vai no `.env` do front. Pode
     aparecer, é pública.
   - `service_role` / `secret` → **NUNCA** no front nem no git. Só usada no passo 2,
     na sua máquina. Clique em "Reveal" para copiar.
   - `Project URL` fica em **Project Settings → API** (ou **Data API**).

5. Crie o `.env` na raiz do `s7-lp` (baseado em `.env.example`):

   ```
   VITE_SUPABASE_URL=https://qzjjyyzhypnybhswwmnm.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```

## 2. Usuários (Pedro = admin · Antonio e Vinicius = sócios)

Precisa da chave **service_role** (ver passo 1.4).

```powershell
cd s7-lp
npm i   # garante @supabase/supabase-js
$env:SUPABASE_URL="https://qzjjyyzhypnybhswwmnm.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="<service_role key>"
# senhas (opcional — senão usa uma padrão trocável no 1º login):
$env:S7_PWD_PEDRO="..."; $env:S7_PWD_ANTONIO="..."; $env:S7_PWD_VINICIUS="..."
node supabase/seed-users.mjs
```

E‑mails/nomes/roles ficam em `supabase/seed-users.mjs`.
Roda quantas vezes quiser — reseta senha/nome/role.

## 3. Edge Function `prospect`

Se o PowerShell reclamar de "execução de scripts foi desabilitada", rode uma vez:
`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` (ou use `npx.cmd`).

```powershell
npx supabase login
npx supabase link --project-ref qzjjyyzhypnybhswwmnm
npx supabase secrets set APIFY_TOKEN=apify_api_xxx APIFY_ACTOR=compass/crawler-google-places GEMINI_API_KEY=AQ.xxx GEMINI_MODEL=gemini-3.6-flash
npx supabase functions deploy prospect
```

- Essas chaves (Apify, Gemini) são **secrets da Edge Function** — nunca vão no `.env`
  do front nem no git.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` já existem
  automaticamente no ambiente da função.
- **Apify**: token em apify.com → Settings → Integrations. O plano free dá ~US$5/mês
  de crédito; o actor `compass/crawler-google-places` cobra por resultado.
- **Gemini**: chave testada e OK (o formato `AQ.` do AI Studio funciona). Modelo padrão
  `gemini-3.6-flash` (o `2.0-flash` foi descontinuado). Se a API falhar, o parecer cai
  na heurística automaticamente.

## 4. Rodar / build

```powershell
npm run dev            # http://localhost:5173  → /login
npm run build          # dist/  (inclui public/.htaccess p/ SPA na Hostinger)
```

Deploy: suba o conteúdo de `dist/` como hoje. O `.htaccess` faz o fallback das
rotas `/admin` e `/login` para o `index.html`.

---

## Como a prospecção funciona

1. **Encontrar Clientes** — escolhe nicho + cidade → busca no Google Maps (Apify)
   ou OpenStreetMap (grátis).
2. **Scanner Local** — vários nichos de uma região de uma vez, ranqueado por potencial.
3. **Roleta** — sorteia nicho + cidade (animação de caça‑níquel) e **dispara a busca
   automaticamente**. Fonte padrão: OpenStreetMap (grátis) — troque para Google/Apify
   no botão se quiser.

Para cada empresa encontrada:

| Situação | Resultado |
|---|---|
| Sem site | **Lead** (score 10) |
| Link vai p/ Instagram/Facebook | **Lead** — "precisa de site próprio" |
| Link vai p/ Linktree/bio.link/etc | **Lead** — "precisa de site próprio" |
| Site próprio | Heurística (HTTPS, responsivo, velocidade, meta tags, ano no rodapé, schema, analytics) + **parecer do Gemini** e nota 0–10 de "vale upgrade" |

**Deduplicação:** toda empresa vista fica em `businesses` (`dedup_key` = nome+telefone+cidade,
e `place_id`). Novas rodadas **ignoram** quem já foi prospectado — a lista só recebe
empresas inéditas. O resultado mostra quantas foram ignoradas por duplicidade.

**Divisão de listas:** marque "dividir entre os vendedores" e os leads são
distribuídos em rodízio entre os usuários `seller` (Antonio / Vinicius). Cada um vê só
a fila dele em **Listas → Minhas**. Pedro (admin) vê tudo e pode reatribuir. Sem marcar,
a lista fica sem dono e o admin atribui manualmente em cada empresa.

## Dashboard

Cards (Faturamento, Recorrência mensal, Ticket médio, Total de vendas), gráfico de
evolução por período e Top 5 Produtos / Últimas Vendas — tudo calculado da tabela
`sales`. Alimente em **Vendas**: formulário manual ou **Importar CSV**
(colunas `cliente, produto, valor, recorrente, mensal, data`).

## Pendências / decisões abertas

- [ ] Confirmar e‑mails reais dos 3 vendedores (hoje `@agencias7.com.br` no seed).
- [ ] Ajustar a lista de cidades da roleta (`src/lib/cities.ts`) — base atual:
      Baixada Santista + Litoral Norte + Vale do Paraíba.
- [ ] Definir produtos/serviços oficiais p/ o cadastro de vendas (`src/pages/admin/Vendas.tsx`).
- [ ] Comissões: a dashboard cita "comissões" mas ainda não há módulo — definir regra.
- [ ] (Opcional) botão de gerar mensagem de abordagem com IA por lead.
