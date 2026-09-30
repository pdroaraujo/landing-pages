// Cria/atualiza os usuários do painel S7 (agência + S7 Card).
// Uso:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node supabase/seed-users.mjs
//
// Senha padrão: PadraoS7@ (ou defina S7_PWD_<KEY> pra sobrescrever uma específica).
// Rode de novo a qualquer momento para resetar senha / nome / role / workspaces.
// Cada um só troca a própria senha depois pelo painel (Conta → Trocar senha).
import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const DEFAULT_PASSWORD = 'PadraoS7@';

const USERS = [
  { key: 'PEDRO',    email: 'pedro@agencias7.com.br',    full_name: 'Pedro Aráujo',       role: 'admin',  workspaces: ['agencia', 's7card'], s7role: 'owner' },
  { key: 'ANTONIO',  email: 'antonio@agencias7.com.br',  full_name: 'Antonio Papadopoli', role: 'seller', workspaces: ['agencia'] },
  { key: 'VINICIUS', email: 'vinicius@agencias7.com.br', full_name: 'Vinicius Amaral',    role: 'seller', workspaces: ['agencia'] },
  { key: 'ENZO',     email: 'enzo@agencias7.com.br',     full_name: 'Enzo Luchetti',      role: 'seller', workspaces: ['s7card'], s7role: 'socio' },
];

const db = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const pwd = (u) => process.env[`S7_PWD_${u.key}`] || DEFAULT_PASSWORD;

// no S7 Card o papel importa: owner (Pedro) e socio (Enzo) veem tudo; vendedor só o que vendeu
const grantWorkspaces = async (userId, workspaces, s7role) => {
  for (const workspace of workspaces) {
    const role = workspace === 's7card' ? s7role ?? 'vendedor' : 'member';
    await db.from('workspace_access').upsert({ user_id: userId, workspace, role }, { onConflict: 'user_id,workspace' });
  }
};

const { data: list } = await db.auth.admin.listUsers({ perPage: 200 });

for (const u of USERS) {
  const existing = list?.users?.find((x) => x.email?.toLowerCase() === u.email.toLowerCase());
  const password = pwd(u);
  let userId;
  if (existing) {
    await db.auth.admin.updateUserById(existing.id, {
      password,
      user_metadata: { full_name: u.full_name, role: u.role },
    });
    userId = existing.id;
    console.log(`↻ atualizado  ${u.email}  (senha: ${password})`);
  } else {
    const { data, error } = await db.auth.admin.createUser({
      email: u.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role },
    });
    if (error) {
      console.error(`✗ ${u.email}: ${error.message}`);
      continue;
    }
    userId = data.user.id;
    console.log(`✔ criado      ${u.email}  (senha: ${password})`);
  }
  await db.from('profiles').upsert({ id: userId, full_name: u.full_name, role: u.role });
  await grantWorkspaces(userId, u.workspaces, u.s7role);
}
console.log(`\nPronto. Senha padrão de todos: ${DEFAULT_PASSWORD} — cada um troca a própria em Conta → Trocar senha.`);
