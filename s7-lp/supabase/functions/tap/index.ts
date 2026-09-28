// Edge Function pública: tap
//  Chamada pela página /r/:code (sem login). Registra o toque na placa e
//  devolve o destino pra onde o front redireciona. Usa service_role porque
//  quem toca a placa não tem sessão nenhuma — a RLS de s7card_tags exige
//  workspace, então essa function é o único jeito de ler/gravar sem estar logado.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'content-type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  let code: string;
  try {
    ({ code } = await req.json());
  } catch {
    return json({ error: 'json inválido' }, 400);
  }
  if (!code || typeof code !== 'string') return json({ error: 'code obrigatório' }, 400);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data: tag } = await db
    .from('s7card_tags')
    .select('id, destination, link_type, status')
    .eq('code', code)
    .maybeSingle();

  if (!tag) return json({ error: 'Placa não encontrada.' }, 404);

  await db.from('s7card_taps').insert({
    tag_id: tag.id,
    user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
  });

  return json({ destination: tag.destination, link_type: tag.link_type });
});
