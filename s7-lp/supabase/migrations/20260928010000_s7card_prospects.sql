-- Mapeamento do S7 Card: pipeline de estabelecimentos-alvo pra vender a placa
-- (a prospectar -> prospectado -> vendido/descartado). Diferente da prospecção
-- da agência: aqui não tem classificação de site nem Gemini — o que importa é
-- só ter o estabelecimento na lista pra bater na porta.
create table if not exists public.s7card_prospects (
  id         uuid primary key default gen_random_uuid(),
  dedup_key  text unique,
  name       text not null,
  phone      text,
  address    text,
  city       text,
  uf         text,
  category   text,
  website    text,
  status     text not null default 'a_prospectar' check (status in ('a_prospectar', 'prospectado', 'vendido', 'descartado')),
  notes      text,
  store_id   uuid references public.s7card_stores(id) on delete set null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists s7card_prospects_status_idx on public.s7card_prospects (status);
create index if not exists s7card_prospects_city_idx on public.s7card_prospects (city);

alter table public.s7card_prospects enable row level security;

drop policy if exists s7card_prospects_rw on public.s7card_prospects;
create policy s7card_prospects_rw on public.s7card_prospects for all
  using (public.has_workspace('s7card')) with check (public.has_workspace('s7card'));
