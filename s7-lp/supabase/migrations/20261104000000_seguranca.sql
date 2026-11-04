-- ============================================================
--  2026-11-04 — endurecimento (passe das skills code-security/auth/database)
--  Rode no SQL Editor (uma vez). Idempotente.
-- ============================================================

-- ---------- 1. Papel NUNCA vem do metadata do próprio usuário ----------
-- O trigger lia raw_user_meta_data->>'role'. Esse campo é controlado por quem
-- se cadastra (supabase.auth.signUp({ options: { data: { role: 'admin' } } })
-- com a anon key pública). Se o cadastro público estiver ligado, qualquer um
-- virava admin. Agora todo usuário novo nasce 'seller'; quem promove é o
-- seed-users.mjs / a function s7card-users (service_role, upsert em profiles).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    'seller'
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- ---------- 2. Funções security definer: só quem precisa executa ----------
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------- 3. Integridade de valores ----------
-- dinheiro/quantidade negativos não fazem sentido em nenhuma tela
do $$ begin
  alter table public.sales add constraint sales_value_nonneg check (value >= 0 and monthly_value >= 0);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.s7card_tags add constraint s7card_tags_qty_pos check (quantity > 0 and sold_value >= 0);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.s7card_clients add constraint s7card_clients_price_nonneg check (monthly_price >= 0);
exception when duplicate_object then null; end $$;

-- ---------- 4. Índices que as telas usam ----------
create index if not exists s7card_stores_created_by_idx on public.s7card_stores (created_by);
create index if not exists s7card_tags_created_by_idx   on public.s7card_tags (created_by);
create index if not exists s7card_taps_tag_time_idx     on public.s7card_taps (tag_id, tapped_at desc);
