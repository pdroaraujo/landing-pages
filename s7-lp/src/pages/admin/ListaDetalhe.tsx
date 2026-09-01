import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Globe, AtSign, Link2, PhoneOff, Phone, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { CallStatus, ListItem, WebsiteStatus, Profile } from '../../lib/types';
import { Card, PageHeader, Badge } from '../../components/admin/ui';

const CALL_LABELS: Record<CallStatus, string> = {
  pending: 'A ligar',
  called: 'Ligou',
  no_answer: 'Não atendeu',
  callback: 'Retornar',
  not_interested: 'Sem interesse',
  won: 'Fechou',
  lost: 'Perdido',
};

const SITE_BADGE: Record<WebsiteStatus, { label: string; tone: 'red' | 'amber' | 'green' | 'blue' | 'default'; icon: typeof Globe }> = {
  none: { label: 'Sem site', tone: 'red', icon: PhoneOff },
  instagram: { label: 'Só Instagram', tone: 'amber', icon: AtSign },
  linktree: { label: 'Linktree', tone: 'amber', icon: Link2 },
  own: { label: 'Site próprio', tone: 'green', icon: Globe },
  unknown: { label: 'Indefinido', tone: 'default', icon: Globe },
};

export default function ListaDetalhe() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [items, setItems] = useState<ListItem[]>([]);
  const [sellers, setSellers] = useState<Profile[]>([]);
  const [listName, setListName] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'leads' | 'mine'>('all');

  const load = async () => {
    setLoading(true);
    const [{ data: list }, { data: rows }, { data: profs }] = await Promise.all([
      supabase.from('lists').select('name').eq('id', id).single(),
      supabase
        .from('list_items')
        .select('*, business:businesses(*), assignee:profiles!list_items_assigned_to_fkey(id, full_name, role)')
        .eq('list_id', id),
      supabase.from('profiles').select('id, full_name, role').eq('role', 'seller'),
    ]);
    setListName((list as { name: string })?.name ?? 'Lista');
    setItems((rows as ListItem[]) ?? []);
    setSellers((profs as Profile[]) ?? []);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  const setStatus = async (itemId: string, call_status: CallStatus) => {
    setItems((s) => s.map((it) => (it.id === itemId ? { ...it, call_status } : it)));
    await supabase
      .from('list_items')
      .update({ call_status, contacted_at: call_status === 'pending' ? null : new Date().toISOString() })
      .eq('id', itemId);
  };

  const assign = async (itemId: string, assigned_to: string) => {
    setItems((s) => s.map((it) => (it.id === itemId ? { ...it, assigned_to } : it)));
    await supabase.from('list_items').update({ assigned_to: assigned_to || null }).eq('id', itemId);
  };

  const visible = useMemo(() => {
    let v = items;
    if (filter === 'leads') v = v.filter((i) => i.business?.is_lead);
    if (filter === 'mine') v = v.filter((i) => i.assigned_to === profile?.id);
    return [...v].sort((a, b) => (b.business?.analysis?.score ?? 0) - (a.business?.analysis?.score ?? 0));
  }, [items, filter, profile]);

  return (
    <div>
      <Link to="/admin/listas" className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">
        <ArrowLeft size={14} /> Listas
      </Link>
      <PageHeader
        title={listName}
        subtitle={`${items.length} empresas · ${items.filter((i) => i.call_status !== 'pending').length} contatadas`}
        actions={
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
            {(['all', 'leads', 'mine'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest ${
                  filter === f ? 'bg-[#fe0000] text-white' : 'text-white/45'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'leads' ? 'Leads' : 'Minhas'}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <p className="text-sm text-white/40">Carregando…</p>
      ) : (
        <div className="grid gap-3">
          {visible.map((it) => {
            const b = it.business!;
            const sb = SITE_BADGE[b.website_status];
            return (
              <Card key={it.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{b.name}</h3>
                      <Badge tone={sb.tone}>{sb.label}</Badge>
                      {b.is_lead && <Badge tone="red">Lead</Badge>}
                      {b.analysis && (
                        <span className="inline-flex items-center gap-1 text-xs text-white/50">
                          <Star size={12} className="text-[#fe0000]" /> {b.analysis.score.toFixed(1)}/10 upgrade
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-white/45">
                      {[b.category, b.city, b.address].filter(Boolean).join(' · ')}
                    </p>
                    {b.phone && (
                      <a href={`tel:${b.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-white/80">
                        <Phone size={13} /> {b.phone}
                      </a>
                    )}
                    {b.website && (
                      <a
                        href={b.website}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-3 inline-flex items-center gap-1.5 text-xs text-sky-400"
                      >
                        <Globe size={12} /> abrir site
                      </a>
                    )}
                    {b.analysis?.verdict && (
                      <p className="mt-2 max-w-xl text-xs italic text-white/50">"{b.analysis.verdict}"</p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {profile?.role === 'admin' && (
                      <select
                        value={it.assigned_to ?? ''}
                        onChange={(e) => assign(it.id, e.target.value)}
                        className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white"
                      >
                        <option value="" className="bg-[#161616]">— sem dono —</option>
                        {sellers.map((s) => (
                          <option key={s.id} value={s.id} className="bg-[#161616]">
                            {s.full_name}
                          </option>
                        ))}
                      </select>
                    )}
                    <select
                      value={it.call_status}
                      onChange={(e) => setStatus(it.id, e.target.value as CallStatus)}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white"
                    >
                      {Object.entries(CALL_LABELS).map(([k, v]) => (
                        <option key={k} value={k} className="bg-[#161616]">
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
