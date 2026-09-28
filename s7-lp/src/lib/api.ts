import { supabase } from './supabase';
import type { ProspectMode } from './types';
import type { ImportedBiz } from './importParse';

export type ProspectRequest = {
  mode: ProspectMode;
  niche: string; // slug
  city: string;
  uf?: string;
  country?: string; // nome do país (default Brasil)
  countryCode?: string; // ISO2
  maxResults?: number;
  /** nichos extras — usado no Scanner Local */
  extraNiches?: string[];
  /** empresas coletadas manualmente (arquivo importado) */
  businesses: ImportedBiz[];
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

export type AnalyzePendingResponse = { analyzed: number; upgrades: number; remaining: number };

/** Analisa os sites próprios ainda pendentes de uma lista (em lotes). */
export async function analyzePending(listId: string): Promise<AnalyzePendingResponse> {
  const { data, error } = await supabase.functions.invoke('analyze-pending', { body: { list_id: listId } });
  if (error) throw new Error(error.message);
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as AnalyzePendingResponse;
}
