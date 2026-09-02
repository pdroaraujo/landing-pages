// Edge Function: analyze-pending
//  Analisa (heurística + Gemini) os sites próprios de uma lista que ainda
//  estão com "análise pendente". Roda em lotes — chame de novo até `remaining` = 0.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { classifyWebsite } from '../prospect/analyze.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'content-type': 'application/json' } });

const BATCH = 20;
const DEADLINE_MS = 130_000;

Deno.serve(async (req) => {
  const startedAt = Date.now();
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const SB_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

  const asUser = createClient(SB_URL, ANON, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: u } = await asUser.auth.getUser();
  if (!u?.user) return json({ error: 'não autenticado' }, 401);

  let listId: string;
  try {
    listId = (await req.json()).list_id;
  } catch {
    return json({ error: 'json inválido' }, 400);
  }
  if (!listId) return json({ error: 'list_id obrigatório' }, 400);

  const db = createClient(SB_URL, SERVICE);

  const { data: rows } = await db
    .from('list_items')
    .select('business:businesses(id, website, website_status, analysis)')
    .eq('list_id', listId);

  type B = { id: string; website: string | null; website_status: string; analysis: { checks?: Record<string, unknown> } | null };
  const pending = ((rows ?? []) as { business: B }[])
    .map((r) => r.business)
    .filter((b) => b && b.website_status === 'own' && b.website && !Object.keys(b.analysis?.checks ?? {}).length);

  const todo = pending.slice(0, BATCH);
  let analyzed = 0;
  let upgrades = 0;

  const POOL = 4;
  const queue = [...todo];
  const worker = async () => {
    while (queue.length && Date.now() - startedAt < DEADLINE_MS - 8000) {
      const b = queue.shift()!;
      try {
        const a = await classifyWebsite(b.website);
        const isLead = a.status === 'instagram' || a.status === 'linktree';
        if (!isLead && a.score >= 6) upgrades++;
        await db
          .from('businesses')
          .update({
            website: a.finalUrl ?? b.website,
            website_status: a.status,
            has_site: a.status === 'own',
            is_lead: isLead,
            analysis: { score: a.score, verdict: a.verdict, checks: a.checks },
            updated_at: new Date().toISOString(),
          })
          .eq('id', b.id);
        analyzed++;
      } catch { /* mantém pendente */ }
    }
  };
  await Promise.all(Array.from({ length: POOL }, worker));

  return json({ analyzed, upgrades, remaining: Math.max(0, pending.length - analyzed) });
});
