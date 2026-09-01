-- ============================================================
--  Agência S7 — Painel Adm  ·  schema Supabase (Postgres)
--  Rode no SQL Editor do projeto (uma vez). Idempotente o suficiente
--  para reexecução em dev; em produção, versione as alterações.
-- ============================================================

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null default '',
  role       text not null default 'seller' check (role in ('admin','seller')),
  created_at timestamptz not null default now()
);

-- cria profile automático quando um usuário é criado no Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role', 'seller')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- BUSINESSES (dedup global) ----------
create table if not exists public.businesses (
  id             uuid primary key default gen_random_uuid(),
  place_id       text unique,
  dedup_key      text unique not null,          -- slug(nome)|telefone-normalizado|cidade
  name           text not null,
  phone          text,
  whatsapp       text,
  address        text,
  city           text,
  uf             text,
  niche          text,                          -- slug do nicho
  category       text,                          -- categoria retornada pela fonte
  rating         numeric,
  reviews        integer,
  lat            numeric,
  lng            numeric,
  website        text,
  website_status text not null default 'unknown'
                 check (website_status in ('none','own','instagram','linktree','unknown')),
  has_site       boolean not null default false,
  is_lead        boolean not null default false,   -- sem site próprio => lead quente
  analysis       jsonb,                            -- { score, verdict, checks }
  first_seen_run uuid,
  times_seen     integer not null default 1,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists businesses_city_niche_idx on public.businesses (city, niche);
create index if not exists businesses_lead_idx on public.businesses (is_lead);

-- ---------- PROSPECT RUNS ----------
create table if not exists public.prospect_runs (
  id            uuid primary key default gen_random_uuid(),
  created_by    uuid references public.profiles(id),
  mode          text not null check (mode in ('buscar','scanner','roleta')),
  source        text not null check (source in ('apify','osm')),
  niche         text,
  city          text,
  uf            text,
  status        text not null default 'running' check (status in ('running','done','error')),
  actor_run_id  text,
  stats         jsonb not null default '{}'::jsonb,
  error         text,
  created_at    timestamptz not null default now()
);

-- ---------- LISTS ----------
create table if not exists public.lists (
  id          uuid primary key default gen_random_uuid(),
  date        date not null default current_date,
  name        text not null,
  mode        text not null check (mode in ('buscar','scanner','roleta')),
  niche       text,
  city        text,
  run_id      uuid references public.prospect_runs(id) on delete set null,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

create table if not exists public.list_items (
  id           uuid primary key default gen_random_uuid(),
  list_id      uuid not null references public.lists(id) on delete cascade,
  business_id  uuid not null references public.businesses(id) on delete cascade,
  assigned_to  uuid references public.profiles(id) on delete set null,
  call_status  text not null default 'pending'
               check (call_status in ('pending','called','no_answer','callback','not_interested','won','lost')),
  notes        text,
  contacted_at timestamptz,
  created_at   timestamptz not null default now(),
  unique (list_id, business_id)
);
create index if not exists list_items_assignee_idx on public.list_items (assigned_to);
create index if not exists list_items_list_idx on public.list_items (list_id);

-- ---------- SALES ----------
create table if not exists public.sales (
  id              uuid primary key default gen_random_uuid(),
  client_name     text not null,
  product         text not null,
  value           numeric not null default 0,
  recurring       boolean not null default false,
  monthly_value   numeric not null default 0,
  contract_signed boolean not null default true,
  seller          text,
  sold_at         date not null default current_date,
  source          text not null default 'manual' check (source in ('manual','import')),
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now()
);
create index if not exists sales_sold_at_idx on public.sales (sold_at);

-- ---------- VIEW p/ a tela de Listas ----------
create or replace view public.list_overview
with (security_invoker = true) as
select
  l.id, l.name, l.date, l.mode, l.niche, l.city,
  count(li.*)                                               as total,
  count(li.*) filter (where li.call_status <> 'pending')    as done,
  count(li.*) filter (where li.assigned_to = auth.uid())    as mine
from public.lists l
left join public.list_items li on li.list_id = l.id
group by l.id;

-- ============================================================
--  RLS
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.businesses    enable row level security;
alter table public.prospect_runs enable row level security;
alter table public.lists         enable row level security;
alter table public.list_items    enable row level security;
alter table public.sales         enable row level security;

-- profiles: cada um lê o próprio; admin lê todos
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- businesses: qualquer autenticado lê; escrita só via service_role (edge function)
drop policy if exists businesses_read on public.businesses;
create policy businesses_read on public.businesses for select
  using (auth.role() = 'authenticated');

-- prospect_runs: autenticado lê
drop policy if exists runs_read on public.prospect_runs;
create policy runs_read on public.prospect_runs for select
  using (auth.role() = 'authenticated');

-- lists: autenticado lê
drop policy if exists lists_read on public.lists;
create policy lists_read on public.lists for select
  using (auth.role() = 'authenticated');

-- list_items: vendedor vê os seus (ou não atribuídos); admin vê tudo
drop policy if exists list_items_read on public.list_items;
create policy list_items_read on public.list_items for select
  using (public.is_admin() or assigned_to = auth.uid() or assigned_to is null);
-- vendedor atualiza status/notas dos seus; admin atualiza qualquer
drop policy if exists list_items_update on public.list_items;
create policy list_items_update on public.list_items for update
  using (public.is_admin() or assigned_to = auth.uid())
  with check (public.is_admin() or assigned_to = auth.uid());

-- sales: autenticado lê; autenticado insere/edita/apaga (equipe pequena)
drop policy if exists sales_read on public.sales;
create policy sales_read on public.sales for select using (auth.role() = 'authenticated');
drop policy if exists sales_write on public.sales;
create policy sales_write on public.sales for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Nada de policy de INSERT em businesses/lists/list_items/prospect_runs:
-- a Edge Function usa a service_role key e ignora RLS.
