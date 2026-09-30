-- ============================================================
--  2026-09-29 — papéis no S7 Card (sócio/vendedor), painel do cliente
--  (30 dias grátis + R$10/mês), valor/quantidade por placa e o
--  conserto do "apagar lista" da agência (faltava policy de delete).
-- ============================================================

-- ---------- 1. Agência: apagar lista de prospecção ----------
-- A tabela só tinha policy de SELECT, então o delete era bloqueado em
-- silêncio pela RLS (sem erro, 0 linhas afetadas). list_items cai junto
-- pelo "on delete cascade".
drop policy if exists lists_delete on public.lists;
create policy lists_delete on public.lists for delete
  using (public.has_workspace('agencia'));

-- ---------- 2. Workspaces e papéis ----------
alter table public.workspace_access drop constraint if exists workspace_access_workspace_check;
alter table public.workspace_access add constraint workspace_access_workspace_check
  check (workspace in ('agencia', 's7card', 'cliente'));

alter table public.workspace_access drop constraint if exists workspace_access_role_check;
alter table public.workspace_access add constraint workspace_access_role_check
  check (role in ('owner', 'member', 'socio', 'vendedor', 'cliente'));

-- Pedro = dono do S7 Card; Enzo = sócio (só S7 Card, acesso total dentro dele)
update public.workspace_access set role = 'owner'
  where workspace = 's7card' and user_id in (select id from auth.users where lower(email) = 'pedro@agencias7.com.br');
update public.workspace_access set role = 'socio'
  where workspace = 's7card' and user_id in (select id from auth.users where lower(email) = 'enzo@agencias7.com.br');

-- papel da pessoa logada dentro do S7 Card (null se não tem acesso)
create or replace function public.s7card_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.workspace_access where user_id = auth.uid() and workspace = 's7card';
$$;

-- acesso total (dono/sócio): vê faturamento geral, equipe, todas as lojas/placas
create or replace function public.s7card_full()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.s7card_role() in ('owner', 'member', 'socio'), false);
$$;

-- quem cria o registro fica gravado sozinho (o vendedor só enxerga o que é dele)
alter table public.s7card_stores    alter column created_by set default auth.uid();
alter table public.s7card_tags      alter column created_by set default auth.uid();
alter table public.s7card_prospects alter column created_by set default auth.uid();

-- ---------- 3. Placa: valor vendido e quantidade ----------
alter table public.s7card_tags add column if not exists sold_value numeric not null default 0;
alter table public.s7card_tags add column if not exists quantity integer not null default 1;

-- ---------- 4. Clientes (painel de métricas da placa) ----------
create table if not exists public.s7card_clients (
  user_id        uuid primary key references public.profiles(id) on delete cascade,
  store_id       uuid not null references public.s7card_stores(id) on delete cascade,
  trial_ends_at  date not null default (current_date + 30),
  paid_until     date,
  monthly_price  numeric not null default 10,
  created_at     timestamptz not null default now()
);
create index if not exists s7card_clients_store_idx on public.s7card_clients (store_id);
alter table public.s7card_clients enable row level security;

-- cliente com acesso liberado (dentro dos 30 dias grátis ou com mensalidade em dia)
create or replace function public.s7card_client_store(active_only boolean)
returns uuid language sql stable security definer set search_path = public as $$
  select store_id from public.s7card_clients
  where user_id = auth.uid()
    and (not active_only or trial_ends_at >= current_date or coalesce(paid_until, current_date - 1) >= current_date);
$$;

drop policy if exists s7card_clients_admin on public.s7card_clients;
create policy s7card_clients_admin on public.s7card_clients for all
  using (public.s7card_full()) with check (public.s7card_full());
drop policy if exists s7card_clients_self on public.s7card_clients;
create policy s7card_clients_self on public.s7card_clients for select
  using (user_id = auth.uid());

-- ---------- 5. RLS por papel ----------
-- lojas: dono/sócio tudo; vendedor só as que ele cadastrou; cliente só a própria (leitura)
drop policy if exists s7card_stores_rw on public.s7card_stores;
create policy s7card_stores_rw on public.s7card_stores for all
  using (public.s7card_full() or (public.s7card_role() = 'vendedor' and created_by = auth.uid()))
  with check (public.s7card_full() or (public.s7card_role() = 'vendedor' and created_by = auth.uid()));
drop policy if exists s7card_stores_client on public.s7card_stores;
create policy s7card_stores_client on public.s7card_stores for select
  using (id = public.s7card_client_store(false));

-- placas: idem (cliente só vê com acesso ativo)
drop policy if exists s7card_tags_rw on public.s7card_tags;
create policy s7card_tags_rw on public.s7card_tags for all
  using (public.s7card_full() or (public.s7card_role() = 'vendedor' and created_by = auth.uid()))
  with check (public.s7card_full() or (public.s7card_role() = 'vendedor' and created_by = auth.uid()));
drop policy if exists s7card_tags_client on public.s7card_tags;
create policy s7card_tags_client on public.s7card_tags for select
  using (store_id = public.s7card_client_store(true));

-- toques: segue a visibilidade da placa
drop policy if exists s7card_taps_read on public.s7card_taps;
create policy s7card_taps_read on public.s7card_taps for select
  using (
    public.s7card_full()
    or exists (
      select 1 from public.s7card_tags t
      where t.id = s7card_taps.tag_id
        and (
          (public.s7card_role() = 'vendedor' and t.created_by = auth.uid())
          or t.store_id = public.s7card_client_store(true)
        )
    )
  );

-- mapeamento (pipeline): qualquer um da equipe do S7 Card (dono, sócio, vendedor)
drop policy if exists s7card_prospects_rw on public.s7card_prospects;
create policy s7card_prospects_rw on public.s7card_prospects for all
  using (public.has_workspace('s7card')) with check (public.has_workspace('s7card'));

-- equipe: dono/sócio enxerga a lista de quem tem acesso ao S7 Card (nomes)
drop policy if exists workspace_access_self on public.workspace_access;
create policy workspace_access_self on public.workspace_access for select
  using (user_id = auth.uid() or public.is_admin() or (workspace in ('s7card', 'cliente') and public.s7card_full()));

drop policy if exists profiles_s7card_team on public.profiles;
create policy profiles_s7card_team on public.profiles for select
  using (
    public.s7card_full()
    and exists (select 1 from public.workspace_access w where w.user_id = profiles.id and w.workspace in ('s7card', 'cliente'))
  );

-- ---------- 6. Enzo só no S7 Card ----------
-- ele tinha ganhado acesso à agência sem querer (migration antiga deu
-- workspace "agencia" pra todo mundo que já existia)
delete from public.workspace_access
  where workspace = 'agencia' and user_id in (select id from auth.users where lower(email) = 'enzo@agencias7.com.br');

-- ---------- 7. Placas de revenda ----------
-- placa separada pra revender (não vai pra loja nenhuma da S7)
alter table public.s7card_tags drop constraint if exists s7card_tags_status_check;
alter table public.s7card_tags add constraint s7card_tags_status_check
  check (status in ('em_estoque', 'instalada', 'defeito', 'revenda'));
