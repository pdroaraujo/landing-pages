// Edge Function: prospect
//  Recebe uma lista de empresas já coletada manualmente (arquivo importado
//  via Roleta), deduplica contra `businesses`, classifica o site
//  (lead / instagram / linktree / upgrade) e cria uma lista pra qualificação
//  (aprovar/rejeitar) — sem atribuir dono ainda.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { classifyUrl, classifyWebsite } from './analyze.ts';

export type RawBiz = {
  place_id: string | null;
  name: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  uf: string | null;
  category: string | null;
  rating: number | null;
  reviews: number | null;
  lat: number | null;
  lng: number | null;
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'content-type': 'application/json' } });

const slug = (s: string) =>
  (s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const digits = (s: string | null) => (s ?? '').replace(/\D/g, '').replace(/^55/, '');

const MAX_SITE_ANALYSIS = 30; // teto de sites analisados por rodada
const DEADLINE_MS = 135_000; // orçamento total da função (limite Supabase ~150s)

Deno.serve(async (req) => {
  const startedAt = Date.now();
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const SB_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

  // --- auth do chamador ---
  const authHeader = req.headers.get('Authorization') ?? '';
  const asUser = createClient(SB_URL, ANON, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await asUser.auth.getUser();
  if (!userData?.user) return json({ error: 'não autenticado' }, 401);
  const uid = userData.user.id;

  const db = createClient(SB_URL, SERVICE);

  let body: {
    mode: 'buscar' | 'scanner' | 'roleta';
    niche: string;
    extraNiches?: string[];
    city: string;
    uf?: string;
    country?: string; // nome do país
    countryCode?: string; // ISO2
    maxResults?: number;
    listName?: string;
    /** empresas já coletadas manualmente (arquivo importado) */
    businesses?: Partial<RawBiz>[];
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'json inválido' }, 400);
  }

  const maxResults = Math.min(Math.max(body.maxResults ?? 100, 10), 500);
  const primaryCity = body.city.split(',')[0].trim();
  const countryName = body.country ?? 'Brasil';

  const { data: run, error: runError } = await db
    .from('prospect_runs')
    .insert({
      created_by: uid,
      mode: body.mode,
      source: 'import',
      niche: body.niche,
      city: body.city,
      uf: body.uf,
      country: countryName,
      status: 'running',
    })
    .select('id')
    .single();
  if (runError || !run) return json({ error: `Falha ao iniciar a rodada: ${runError?.message ?? 'sem retorno do banco'}` }, 500);
  const runId = run.id as string;

  try {
    // --- 1. normaliza o arquivo importado ---
    const raw: RawBiz[] = (body.businesses ?? [])
      .map((b) => ({
        place_id: b.place_id ?? null,
        name: (b.name ?? '').trim(),
        phone: b.phone ?? null,
        website: b.website ?? null,
        address: b.address ?? null,
        city: b.city ?? primaryCity,
        uf: b.uf ?? body.uf ?? null,
        category: b.category ?? null,
        rating: typeof b.rating === 'number' ? b.rating : null,
        reviews: typeof b.reviews === 'number' ? b.reviews : null,
        lat: b.lat ?? null,
        lng: b.lng ?? null,
      }))
      .filter((b) => b.name)
      .slice(0, maxResults);
    if (!raw.length) throw new Error('Nenhuma empresa válida no arquivo importado.');

    // dedup interno da rodada
    const byKey = new Map<string, RawBiz>();
    for (const b of raw) {
      const key = `${slug(b.name)}|${digits(b.phone)}|${slug(b.city ?? primaryCity)}`;
      if (!byKey.has(key)) byKey.set(key, b);
    }

    const keys = [...byKey.keys()];
    const placeIds = [...byKey.values()].map((b) => b.place_id).filter(Boolean) as string[];

    // --- 2. dedup contra o banco ---
    const { data: existing } = await db
      .from('businesses')
      .select('id, dedup_key, place_id')
      .or(`dedup_key.in.(${keys.map((k) => JSON.stringify(k)).join(',')})${placeIds.length ? `,place_id.in.(${placeIds.map((k) => JSON.stringify(k)).join(',')})` : ''}`);
    const knownKeys = new Set((existing ?? []).map((e) => e.dedup_key));
    const knownPlaces = new Set((existing ?? []).map((e) => e.place_id).filter(Boolean));

    const fresh: { key: string; b: RawBiz }[] = [];
    for (const [key, b] of byKey) {
      if (knownKeys.has(key)) continue;
      if (b.place_id && knownPlaces.has(b.place_id)) continue;
      fresh.push({ key, b });
    }

    // --- 3. classificação instantânea pela URL (sem rede) ---
    const rows = fresh.map(({ key, b }) => {
      const a = classifyUrl(b.website);
      const isLead = a.status === 'none' || a.status === 'instagram' || a.status === 'linktree';
      return {
        dedup_key: key,
        place_id: b.place_id,
        name: b.name,
        phone: b.phone,
        whatsapp: b.phone ? '55' + digits(b.phone) : null,
        address: b.address,
        city: b.city ?? primaryCity,
        uf: b.uf ?? body.uf ?? null,
        country: countryName,
        niche: body.niche,
        category: b.category,
        rating: b.rating,
        reviews: b.reviews,
        lat: b.lat,
        lng: b.lng,
        website: a.finalUrl ?? b.website,
        website_status: a.status,
        has_site: a.status === 'own',
        is_lead: isLead,
        analysis: { score: a.score, verdict: a.verdict, checks: a.checks },
        first_seen_run: runId,
      };
    });

    // --- 4. insere businesses ---
    let inserted: { id: string; website: string | null; website_status: string }[] = [];
    if (rows.length) {
      const { data, error } = await db.from('businesses').insert(rows).select('id, website, website_status');
      if (error) throw error;
      inserted = data ?? [];
    }

    // --- 5. cria lista + itens (só empresas novas; sem dono e sem qualificação ainda) ---
    const { data: list } = await db
      .from('lists')
      .insert({
        name: body.listName ?? `${body.niche} · ${primaryCity}`,
        mode: body.mode,
        niche: body.niche,
        city: body.city,
        country: countryName,
        run_id: runId,
        created_by: uid,
      })
      .select('id')
      .single();
    const listId = list!.id as string;

    const items = inserted.map((row) => ({
      list_id: listId,
      business_id: row.id,
      assigned_to: null,
      qualified: null,
    }));
    if (items.length) await db.from('list_items').insert(items);

    const ownSites = inserted.filter((r) => r.website_status === 'own' && r.website);
    const stats = {
      found: raw.length,
      new: inserted.length,
      duplicates: byKey.size - fresh.length,
      leads: rows.filter((r) => r.is_lead).length,
      upgrades: 0,
      analyzing: ownSites.length,
    };

    await db.from('prospect_runs').update({ status: 'done', stats }).eq('id', runId);

    // --- 6. análise dos sites próprios, dentro do orçamento de tempo restante ---
    if (ownSites.length) {
      const deadline = startedAt + DEADLINE_MS;
      const { upgrades, pending } = await analyzeSites(
        db,
        ownSites.slice(0, MAX_SITE_ANALYSIS),
        deadline,
      );
      stats.upgrades = upgrades;
      stats.analyzing = pending;
      await db.from('prospect_runs').update({ stats }).eq('id', runId);
    }

    return json({ list_id: listId, run_id: runId, stats });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await db.from('prospect_runs').update({ status: 'error', error: msg }).eq('id', runId);
    return json({ error: msg }, 500);
  }
});

const MAX_GEMINI = 12; // teto de pareceres com IA por rodada (quota grátis do Gemini)

// deno-lint-ignore no-explicit-any
async function analyzeSites(db: any, sites: { id: string; website: string | null }[], deadline: number) {
  let upgrades = 0;
  let done = 0;
  let aiUsed = 0;
  const POOL = 4;
  const queue = [...sites];
  const worker = async () => {
    while (queue.length && Date.now() < deadline - 6000) {
      const s = queue.shift()!;
      try {
        const useAI = aiUsed < MAX_GEMINI;
        if (useAI) aiUsed++;
        const a = await classifyWebsite(s.website, useAI);
        const isLead = a.status === 'instagram' || a.status === 'linktree';
        if (!isLead && a.score >= 6) upgrades++;
        await db
          .from('businesses')
          .update({
            website: a.finalUrl ?? s.website,
            website_status: a.status,
            has_site: a.status === 'own',
            is_lead: isLead,
            analysis: { score: a.score, verdict: a.verdict, checks: a.checks },
            updated_at: new Date().toISOString(),
          })
          .eq('id', s.id);
        done++;
      } catch {
        /* mantém o placeholder "análise pendente" */
      }
    }
  };
  await Promise.all(Array.from({ length: POOL }, worker));
  return { upgrades, pending: sites.length - done };
}
