import { supabase } from './supabase';
import type { ProspectMode, ProspectSource } from './types';

export type ProspectRequest = {
  mode: ProspectMode;
  source: ProspectSource;
  niche: string; // slug
  city: string;
  uf?: string;
  country?: string; // nome do país (default Brasil)
  countryCode?: string; // ISO2
  maxResults?: number;
  /** nichos extras — usado no Scanner Local */
  extraNiches?: string[];
  listName?: string;
};

export type ProspectResponse = {
  list_id: string;
  run_id: string;
  stats: {
    found: number;
    new: number;
    duplicates: number;
    leads: number; // sem site próprio
    upgrades: number; // com site, vale upgrade (preenchido após a análise em background)
    analyzing?: number; // sites próprios sendo analisados agora
  };
};

export async function runProspect(req: ProspectRequest): Promise<ProspectResponse> {
  const { data, error } = await supabase.functions.invoke('prospect', { body: req });
  if (error) throw new Error(error.message);
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as ProspectResponse;
}
