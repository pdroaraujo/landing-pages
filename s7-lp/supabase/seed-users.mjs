// Cria/atualiza os usuários do painel S7.
// Uso:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node supabase/seed-users.mjs
//
// Senhas: definidas em USERS abaixo OU via env S7_PWD_<slug> (ex: S7_PWD_PEDRO).
// Rode de novo a qualquer momento para resetar senha / nome / role.
import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const USERS = [
  { key: 'PEDRO',    email: 'pedro@agencias7.com.br',    full_name: 'Pedro Aráujo',       role: 'admin'  },
  { key: 'ANTONIO',  email: 'antonio@agencias7.com.br',  full_name: 'Antonio Papadopoli', role: 'seller' },
  { key: 'VINICIUS', email: 'vinicius@agencias7.com.br', full_name: 'Vinicius Amaral',    role: 'seller' },
];

const db = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const pwd = (u) => process.env[`S7_PWD_${u.key}`] || `S7-${u.key.toLowerCase()}-troque123`;

const { data: list } = await db.auth.admin.listUsers({ perPage: 200 });

for (const u of USERS) {
  const existing = list?.users?.find((x) => x.email?.toLowerCase() === u.email.toLowerCase());
  const password = pwd(u);
  if (existing) {
    await db.auth.admin.updateUserById(existing.id, {
      password,
      user_metadata: { full_name: u.full_name, role: u.role },
    });
    await db.from('profiles').upsert({ id: existing.id, full_name: u.full_name, role: u.role });
    console.log(`↻ atualizado  ${u.email}`);
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
    await db.from('profiles').upsert({ id: data.user.id, full_name: u.full_name, role: u.role });
    console.log(`✔ criado      ${u.email}  (senha: ${password})`);
  }
}
console.log('\nPronto. Troque as senhas padrão após o primeiro login.');
