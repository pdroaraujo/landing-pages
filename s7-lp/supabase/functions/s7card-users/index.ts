// Edge Function: s7card-users
//  Cria logins do S7 Card direto do painel (só dono/sócio pode chamar):
//   - action "vendedor": vendedor de placas (vê só as próprias vendas)
//   - action "cliente":  dono da loja, painel de métricas (30 dias grátis)
//  Criar usuário no Auth exige service_role — por isso não dá pra fazer do front.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'content-type': 'application/json' } });

type Body = {
  action: 'vendedor' | 'cliente';
  email: string;
  password: string;
  full_name: string;
  store_id?: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: full, error: roleErr } = await caller.rpc('s7card_full');
  if (roleErr || full !== true) return json({ error: 'Só o dono ou sócio do S7 Card pode criar acessos.' }, 403);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'json inválido' }, 400);
  }
  const email = body.email?.trim().toLowerCase();
  const full_name = body.full_name?.trim();
  if (!email || !body.password || body.password.length < 6 || !full_name) {
    return json({ error: 'Preencha nome, e-mail e uma senha de pelo menos 6 caracteres.' }, 400);
  }
  if (body.action === 'cliente' && !body.store_id) return json({ error: 'Escolha a loja do cliente.' }, 400);

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: body.password,
    email_confirm: true,
    user_metadata: { full_name, role: 'seller' },
  });
  if (error || !created.user) {
    const msg = error?.message ?? 'erro';
    return json({ error: /already|registered|exists/i.test(msg) ? 'Já existe um usuário com esse e-mail.' : msg }, 400);
  }
  const userId = created.user.id;

  await admin.from('profiles').upsert({ id: userId, full_name, role: 'seller' });

  if (body.action === 'vendedor') {
    await admin.from('workspace_access').upsert({ user_id: userId, workspace: 's7card', role: 'vendedor' });
  } else {
    await admin.from('workspace_access').upsert({ user_id: userId, workspace: 'cliente', role: 'cliente' });
    const { error: cErr } = await admin.from('s7card_clients').insert({ user_id: userId, store_id: body.store_id });
    if (cErr) return json({ error: cErr.message }, 400);
  }

  return json({ ok: true, user_id: userId });
});
