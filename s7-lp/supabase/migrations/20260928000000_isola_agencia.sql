-- As policies de businesses/prospect_runs/lists/list_items/sales usavam
-- "auth.role() = 'authenticated'" — ou seja, QUALQUER usuário logado (inclusive
-- o Enzo, que só devia enxergar o S7 Card) conseguia ler prospecção/vendas da
-- agência via API direta. Aperta pra exigir workspace 'agencia'.

drop policy if exists businesses_read on public.businesses;
create policy businesses_read on public.businesses for select
  using (public.has_workspace('agencia'));

drop policy if exists runs_read on public.prospect_runs;
create policy runs_read on public.prospect_runs for select
  using (public.has_workspace('agencia'));

drop policy if exists lists_read on public.lists;
create policy lists_read on public.lists for select
  using (public.has_workspace('agencia'));

drop policy if exists list_items_read on public.list_items;
create policy list_items_read on public.list_items for select
  using (public.has_workspace('agencia') and (public.is_admin() or assigned_to = auth.uid() or assigned_to is null));

drop policy if exists list_items_update on public.list_items;
create policy list_items_update on public.list_items for update
  using (public.has_workspace('agencia') and (public.is_admin() or assigned_to = auth.uid()))
  with check (public.has_workspace('agencia') and (public.is_admin() or assigned_to = auth.uid()));

drop policy if exists sales_read on public.sales;
create policy sales_read on public.sales for select
  using (public.has_workspace('agencia'));

drop policy if exists sales_write on public.sales;
create policy sales_write on public.sales for all
  using (public.has_workspace('agencia')) with check (public.has_workspace('agencia'));
