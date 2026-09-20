# Painel Adm — Agência S7 (`/admin`)

Área administrativa adicionada ao `s7-lp`: **Dashboard**, **Prospecção**
(Encontrar Clientes · Scanner Local · Roleta) e **Listas** de ligação, com login.

- Stack: Vite + React 19 + Tailwind v4 + react-router (front) · **Supabase**
  (Auth + Postgres + Edge Function) · OpenStreetMap (busca automática, grátis) ·
  Gemini (análise de site). **Sem Apify** — removida em 2026-09-20.
- Rotas: `/` (LP pública, intacta), `/login`, `/admin/*` (protegida).
- Design: mesmo padrão S7 — fundo `#0f0f0f`, vermelho `#fe0000`, Plus Jakarta Sans.

## Estado (2026-09-20)

- Projeto Supabase `projeto-s7` (`qzjjyyzhypnybhswwmnm`) · schema aplicado.
- Logins: **pedro@agencias7.com.br** (admin), **antonio@** e **vinicius@** (sócios).
  Senha inicial `S7-<nome>-troque123` — trocar no 1º acesso.
- ⚠️ **Projetos Supabase free pausam sozinhos após ~1 semana sem uso.** Se a função
  `prospect` voltar com erro/404, primeiro confira no dashboard
  (supabase.com/dashboard/project/qzjjyyzhypnybhswwmnm) se aparece um botão
  **"Restore project"** — clique nele (não perde dado nenhum) e espere ~1-2 min.
  Depois disso é só rodar `npx supabase functions deploy prospect` de novo.
- **Apify foi removida.** A busca automática (Buscar/Scanner/Roleta → "Prospectar
  automático") usa só OpenStreetMap, que é grátis mas tem cobertura mais fraca no
  Brasil. Pra prospecção de volume real, use a **Roleta → Importar arquivo**: ela
  gera um prompt pronto pra colar no Claude (ele busca no Google Maps e devolve um
  CSV), você sobe o arquivo e o mesmo pipeline de sempre (dedup, classificação de
  site, parecer do Gemini) roda em cima.

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
npx supabase secrets set GEMINI_API_KEY=AQ.xxx GEMINI_MODEL=gemini-flash-lite-latest
npx supabase functions deploy prospect
npx supabase functions deploy analyze-pending
```

- A chave do Gemini é **secret da Edge Function** — nunca vai no `.env` do front
  nem no git. **Já configurada** no projeto `qzjjyyzhypnybhswwmnm`.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` já existem
  automaticamente no ambiente da função.
- **Gemini**: `gemini-flash-lite-latest` (o `3.6-flash` free tier só dá 20 req/dia).
  Se a API falhar, o parecer cai na heurística automaticamente.
- Os secrets `APIFY_TOKEN`/`APIFY_ACTOR` ficaram configurados no projeto mas não
  são mais lidos por nada — pode apagar com `npx supabase secrets unset APIFY_TOKEN APIFY_ACTOR`
  se quiser limpar.

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
   Europa/EUA/Dubai) → busca automática no OpenStreetMap (grátis). Coleta até
   ~300 empresas por rodada, mas a cobertura no Brasil é mais fraca que o Google Maps.
2. **Scanner Local** — vários nichos de uma cidade de uma vez, mesma fonte.
3. **Roleta** — sorteia nicho + cidade (caça‑níquel) — escopo Brasil (5.570 cidades)
   ou Mundo (Europa/EUA/Dubai). Depois de sortear, você escolhe:
   - **Prospectar automático** — dispara o OSM na hora, igual Buscar/Scanner.
   - **Importar arquivo** — mostra um prompt pronto (já com o nicho+cidade sorteados)
     pra colar no Claude, pedindo pra ele buscar no Google Maps e devolver um CSV.
     Você sobe esse CSV (ou um `.xlsx`) e ele entra no mesmo pipeline abaixo.
     Colunas esperadas (cabeçalho flexível — aceita variações em PT/EN):
     `nome, telefone, endereco, cidade, categoria, site, avaliacao, avaliacoes`.
     Só `nome` é obrigatório.

Para cada empresa (venha do OSM ou do arquivo importado):

| Situação | Resultado |
|---|---|
| Sem site | **Lead** (na hora) |
| Link vai p/ Instagram/Facebook | **Lead** — "precisa de site próprio" |
| Link vai p/ Linktree/bio.link/etc | **Lead** — "precisa de site próprio" |
| Site próprio | Heurística (HTTPS, responsivo, velocidade, meta tags, schema, analytics) + **parecer do Gemini** e nota 0–10 de "vale upgrade" |

Em rodadas grandes, alguns sites próprios podem ficar com **"análise pendente"**
(teto de segurança pra não estourar o tempo da função nem a cota do Gemini). Na tela
da lista aparece o botão **"Analisar N sites"** — roda em lotes (função
`analyze-pending`) até zerar.

**Deduplicação:** toda empresa vista fica em `businesses` (`dedup_key` = nome+telefone+cidade,
+ `place_id` quando existe). Novas rodadas — automáticas ou importadas — **ignoram**
quem já foi prospectado; a lista só recebe empresas inéditas.

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

- [ ] **Confirmar que o `dist/` mais recente está na Hostinger** (ver seção 5) — a
      cada mudança de código precisa rebuildar e subir de novo.
- [ ] **Restaurar o projeto Supabase se estiver pausado** (ver "Estado" acima) antes
      de testar qualquer coisa depois de um período sem uso.
- [ ] Definir produtos/serviços oficiais p/ o cadastro de vendas (`src/pages/admin/Vendas.tsx`).
- [ ] Comissões: a dashboard cita "comissões" mas ainda não há módulo — definir regra.
- [ ] (Opcional) botão de gerar mensagem de abordagem com IA por lead.
- [ ] (Opcional) sócios (Antonio/Vinicius) também poderem qualificar, não só o admin.
