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
npx supabase secrets set APIFY_TOKEN=apify_api_xxx APIFY_ACTOR=compass/google-maps-extractor GEMINI_API_KEY=AQ.xxx GEMINI_MODEL=gemini-flash-lite-latest
npx supabase functions deploy prospect
```

- Essas chaves (Apify, Gemini) são **secrets da Edge Function** — nunca vão no `.env`
  do front nem no git. **Já configuradas** no projeto `qzjjyyzhypnybhswwmnm`.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` já existem
  automaticamente no ambiente da função.
- **Apify**: actor `compass/google-maps-extractor` (~40s/rodada). Plano free ≈ US$5/mês.
- **Gemini**: `gemini-flash-lite-latest` (o `3.6-flash` free tier só dá 20 req/dia).
  Se a API falhar, o parecer cai na heurística automaticamente.

## 4. Rodar / build

```powershell
npm run dev            # http://localhost:5173  → /login
npm run build          # gera dist/  (o .env PRECISA existir antes do build)
```

## 5. Deploy na Hostinger (MANUAL — git não faz deploy)

Commit/push no GitHub **não** publica nada. O site sobe assim:

1. `npm run build` com o `.env` presente (as chaves do Supabase são "assadas" no bundle).
2. No **hPanel → Gerenciador de Arquivos** (ou FTP), abra a pasta que serve
   `agencias7.com.br` (normalmente `public_html/`).
3. Suba **todo o conteúdo de `dist/`** (não a pasta, o conteúdo), sobrescrevendo.
   Pode apagar a `assets/` antiga antes — os nomes têm hash novo.
4. **CRÍTICO: incluir o `.htaccess`** (arquivo oculto). No Gerenciador de Arquivos:
   ⚙️ → "Mostrar arquivos ocultos". No FileZilla: Servidor → "Forçar exibição de
   arquivos ocultos". Sem ele, `/admin` e `/login` dão **404**.
5. Testar: `https://agencias7.com.br/login`.

> Se rebuildar sem o `.env`, o `/login` abre mas não conecta no Supabase. Sempre
> confira que `s7-lp/.env` existe antes do `npm run build`.

---

## Como a prospecção funciona

1. **Encontrar Clientes** — nicho + país/UF/cidade (Brasil inteiro via IBGE, ou
   Europa/EUA/Dubai) → busca no Google Maps (Apify) ou OpenStreetMap (grátis).
   Coleta até ~150 empresas por rodada.
2. **Scanner Local** — vários nichos de uma cidade de uma vez.
3. **Roleta** — sorteia nicho + cidade (caça‑níquel) — escopo Brasil (5.570 cidades)
   ou Mundo (Europa/EUA/Dubai) — e **dispara a busca automaticamente**.

Para cada empresa encontrada:

| Situação | Resultado |
|---|---|
| Sem site | **Lead** (na hora) |
| Link vai p/ Instagram/Facebook | **Lead** — "precisa de site próprio" |
| Link vai p/ Linktree/bio.link/etc | **Lead** — "precisa de site próprio" |
| Site próprio | Heurística (HTTPS, responsivo, velocidade, meta tags, schema, analytics) + **parecer do Gemini** e nota 0–10 de "vale upgrade" |

Em rodadas grandes (100+), a Apify come quase todo o tempo da função e alguns sites
próprios ficam com **"análise pendente"**. Na tela da lista aparece o botão
**"Analisar N sites"** — ele roda a análise em lotes (função `analyze-pending`) até zerar.

**Deduplicação:** toda empresa vista fica em `businesses` (`dedup_key` = nome+telefone+cidade,
+ `place_id`). Novas rodadas **ignoram** quem já foi prospectado — a lista só recebe
empresas inéditas.

## Qualificação e distribuição

A prospecção **não monta lista pronta**. Ela cria uma lista com todas as empresas
"a qualificar". Na tela da lista (**Listas → [a lista]**):

- Abas **Todas · Sem site · Com site**
- Cada empresa: **Aprovar** / **Rejeitar** (só admin)
- Depois, botão **"Distribuir N aprovadas"** → reparte as aprovadas em rodízio entre
  Pedro / Antonio / Vinicius. Cada vendedor vê a fila dele; o status de ligação
  (Ligou / Não atendeu / Fechou…) só aparece nas aprovadas.

## Dashboard

Cards (Faturamento, Recorrência mensal, Ticket médio, Total de vendas), gráfico de
evolução por período e Top 5 Produtos / Últimas Vendas — tudo calculado da tabela
`sales`. Alimente em **Vendas**: formulário manual ou **Importar CSV**
(colunas `cliente, produto, valor, recorrente, mensal, data`).

## Pendências / decisões abertas

- [ ] **Subir o `dist/` pra Hostinger** (ver seção 5) — o `/admin` ainda não está no ar.
- [ ] Definir produtos/serviços oficiais p/ o cadastro de vendas (`src/pages/admin/Vendas.tsx`).
- [ ] Comissões: a dashboard cita "comissões" mas ainda não há módulo — definir regra.
- [ ] (Opcional) botão de gerar mensagem de abordagem com IA por lead.
- [ ] (Opcional) sócios (Antonio/Vinicius) também poderem qualificar, não só o admin.
