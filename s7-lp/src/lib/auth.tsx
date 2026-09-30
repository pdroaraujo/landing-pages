import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseReady } from './supabase';
import type { Profile } from './types';

export type Workspace = 'agencia' | 's7card' | 'cliente';
/** papel dentro do S7 Card: owner/member = dono, socio = sócio, vendedor = só vê o que vendeu */
export type S7Role = 'owner' | 'member' | 'socio' | 'vendedor' | 'cliente';

type AuthCtx = {
  session: Session | null;
  profile: Profile | null;
  workspaces: Workspace[] | null; // null = ainda carregando
  s7Role: S7Role | null;
  /** dono ou sócio do S7 Card (vê faturamento geral, equipe, clientes) */
  s7Full: boolean;
  loading: boolean;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [s7Role, setS7Role] = useState<S7Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseReady) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setWorkspaces(null);
      setS7Role(null);
      return;
    }
    supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile((data as Profile) ?? null));
    supabase
      .from('workspace_access')
      .select('workspace, role')
      .eq('user_id', session.user.id)
      .then(({ data }) => {
        const rows = (data ?? []) as { workspace: Workspace; role: S7Role }[];
        setS7Role(rows.find((w) => w.workspace === 's7card')?.role ?? null);
        setWorkspaces(rows.map((w) => w.workspace));
      });
  }, [session]);

  const signIn: AuthCtx['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ session, profile, workspaces, s7Role, s7Full: s7Role === 'owner' || s7Role === 'member' || s7Role === 'socio', loading, ready: supabaseReady, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth fora do AuthProvider');
  return c;
}
