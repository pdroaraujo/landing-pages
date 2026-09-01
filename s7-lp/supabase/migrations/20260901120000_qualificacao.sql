-- Qualificação de leads antes de virar fila de ligação.
-- qualified: null = não avaliado · true = aprovado · false = rejeitado
alter table public.list_items
  add column if not exists qualified boolean;

-- país da rodada/lista (prospecção mundial)
alter table public.prospect_runs add column if not exists country text;
alter table public.lists         add column if not exists country text;
alter table public.businesses     add column if not exists country text;

-- view de listas: contadores de qualificação
create or replace view public.list_overview
with (security_invoker = true) as
select
  l.id, l.name, l.date, l.mode, l.niche, l.city,
  count(li.*)                                                     as total,
  count(li.*) filter (where li.call_status <> 'pending')          as done,
  count(li.*) filter (where li.assigned_to = auth.uid())          as mine,
  count(li.*) filter (where li.qualified is null)                 as pending_qual,
  count(li.*) filter (where li.qualified is true)                 as approved,
  count(li.*) filter (where li.qualified is false)                as rejected
from public.lists l
left join public.list_items li on li.list_id = l.id
group by l.id;
