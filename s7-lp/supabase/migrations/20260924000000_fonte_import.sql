-- Apify saiu, entrou a importação manual de arquivo (source = 'import').
-- O check constraint de prospect_runs.source só aceitava ('apify','osm') e
-- travava qualquer request com source='import' num 500 cru (insert fora do
-- try/catch da function). Mantém 'apify' na lista só por compatibilidade com
-- runs antigos já gravados.
alter table public.prospect_runs drop constraint if exists prospect_runs_source_check;
alter table public.prospect_runs
  add constraint prospect_runs_source_check check (source in ('apify', 'osm', 'import'));
