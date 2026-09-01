import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Profile } from './types';

/** Todos os usuários do painel (admin + sellers), ordenados por criação. */
export function useTeam() {
  const [team, setTeam] = useState<Profile[]>([]);
  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, role')
      .order('created_at', { ascending: true })
      .then(({ data }) => setTeam((data as Profile[]) ?? []));
  }, []);
  return team;
}
