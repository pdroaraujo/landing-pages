-- ============================================================
--  2026-10-23 — Estoque de tags NFC na gráfica
--  Livro-caixa de movimentações: o saldo que está com a gráfica é
--  enviadas - retiradas - perdas (+/- ajustes). Nada é apagado à toa:
--  cada linha é um registro do que aconteceu.
-- ============================================================
create table if not exists public.s7card_grafica_movs (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('envio', 'retirada', 'perda', 'ajuste')),
  quantity     integer not null check (quantity <> 0),
  grafica      text not null default 'Gráfica',
  item         text not null default 'Tag NFC',
  unit_cost    numeric,
  happened_at  date not null default current_date,
  notes        text,
  created_by   uuid references public.profiles(id) default auth.uid(),
  created_at   timestamptz not null default now()
);
create index if not exists s7card_grafica_movs_date_idx on public.s7card_grafica_movs (happened_at);

alter table public.s7card_grafica_movs enable row level security;

-- dono/sócio controlam; vendedor só consulta
drop policy if exists s7card_grafica_read on public.s7card_grafica_movs;
create policy s7card_grafica_read on public.s7card_grafica_movs for select
  using (public.has_workspace('s7card'));
drop policy if exists s7card_grafica_write on public.s7card_grafica_movs;
create policy s7card_grafica_write on public.s7card_grafica_movs for all
  using (public.s7card_full()) with check (public.s7card_full());
