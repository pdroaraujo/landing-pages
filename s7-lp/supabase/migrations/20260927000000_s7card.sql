-- ============================================================
--  S7 Card — projeto de placas NFC (avaliação/redes/cardápio/etc)
--  Seção totalmente separada do workspace "agencia" (prospecção/vendas).
--  Acesso por workspace, não por role — assim dá pra ter alguém (Enzo)
--  que só existe nesse projeto, sem nenhuma visibilidade da agência.
-- ============================================================

-- ---------- WORKSPACES ----------
create table if not exists public.workspace_access (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  workspace text not null check (workspace in ('agencia', 's7card')),
  role      text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (user_id, workspace)
);

create or replace function public.has_workspace(ws text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspace_access where user_id = auth.uid() and workspace = ws);
$$;

-- todo mundo que já existe (Pedro/Antonio/Vinicius) fica no workspace "agencia";
-- Pedro também é owner do "s7card" (o Enzo entra depois, via seed próprio).
insert into public.workspace_access (user_id, workspace, role)
select id, 'agencia', case when role = 'admin' then 'owner' else 'member' end
from public.profiles
on conflict do nothing;

insert into public.workspace_access (user_id, workspace, role)
select id, 's7card', 'owner' from public.profiles where role = 'admin'
on conflict do nothing;

-- ---------- LOJAS ----------
create table if not exists public.s7card_stores (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  category       text,
  address        text,
  city           text,
  uf             text,
  contact_name   text,
  contact_phone  text,
  status         text not null default 'ativa' check (status in ('ativa', 'inativa')),
  sold_value     numeric not null default 0,
  sold_at        date not null default current_date,
  notes          text,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now()
);

-- ---------- PLACAS (hardware NFC) ----------
create table if not exists public.s7card_tags (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,  -- usado na URL pública /r/:code
  link_type      text not null default 'google_review' check (link_type in (
                   'google_review', 'whatsapp', 'instagram', 'menu', 'hub',
                   'wifi', 'vcard', 'pix', 'coupon', 'other'
                 )),
  destination    text not null,          -- URL (ou payload, ex: wifi) de destino
  label          text,                   -- apelido interno (ex: "balcão", "mesa 4")
  store_id       uuid references public.s7card_stores(id) on delete set null,
  status         text not null default 'em_estoque' check (status in ('em_estoque', 'instalada', 'defeito')),
  installed_at   date,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now()
);
create index if not exists s7card_tags_store_idx on public.s7card_tags (store_id);

-- ---------- TOQUES (analytics — o diferencial do produto) ----------
create table if not exists public.s7card_taps (
  id         uuid primary key default gen_random_uuid(),
  tag_id     uuid not null references public.s7card_tags(id) on delete cascade,
  tapped_at  timestamptz not null default now(),
  user_agent text
);
create index if not exists s7card_taps_tag_idx on public.s7card_taps (tag_id);
create index if not exists s7card_taps_tapped_at_idx on public.s7card_taps (tapped_at);

-- ============================================================
--  RLS — só quem tem acesso ao workspace 's7card' enxerga qualquer coisa daqui
-- ============================================================
alter table public.workspace_access enable row level security;
alter table public.s7card_stores    enable row level security;
alter table public.s7card_tags      enable row level security;
alter table public.s7card_taps      enable row level security;

drop policy if exists workspace_access_self on public.workspace_access;
create policy workspace_access_self on public.workspace_access for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists s7card_stores_rw on public.s7card_stores;
create policy s7card_stores_rw on public.s7card_stores for all
  using (public.has_workspace('s7card')) with check (public.has_workspace('s7card'));

drop policy if exists s7card_tags_rw on public.s7card_tags;
create policy s7card_tags_rw on public.s7card_tags for all
  using (public.has_workspace('s7card')) with check (public.has_workspace('s7card'));

-- taps: só leitura pro workspace (a escrita é feita pela function pública via service_role)
drop policy if exists s7card_taps_read on public.s7card_taps;
create policy s7card_taps_read on public.s7card_taps for select
  using (public.has_workspace('s7card'));
