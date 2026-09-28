-- Acompanhamento de avaliações do Google pra cada loja: quantas tinha quando
-- instalou a placa (baseline) vs. a contagem mais recente (atualizada à mão
-- periodicamente) — a diferença é o que vira relatório mensal de resultado.
alter table public.s7card_stores add column if not exists reviews_baseline integer;
alter table public.s7card_stores add column if not exists reviews_baseline_at date;
alter table public.s7card_stores add column if not exists reviews_current integer;
alter table public.s7card_stores add column if not exists reviews_updated_at date;
