import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  // Não quebra a landing page pública; só o /admin depende disso.
  console.warn('[s7-admin] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes — área adm indisponível.');
}

export const supabase = createClient(url ?? 'http://localhost', anon ?? 'anon', {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const supabaseReady = Boolean(url && anon);
