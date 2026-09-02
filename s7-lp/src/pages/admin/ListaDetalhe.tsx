import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Globe, AtSign, Link2, PhoneOff, Phone, Star, Check, X, Users, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useTeam } from '../../lib/useTeam';
import { analyzePending } from '../../lib/api';
import type { CallStatus, ListItem, WebsiteStatus } from '../../lib/types';
import { Card, PageHeader, Badge, Btn } from '../../components/admin/ui';

const CALL_LABELS: Record<CallStatus, string> = {
  pending: 'A ligar',
  called: 'Ligou',
  no_answer: 'Não atendeu',
  callback: 'Retornar',
  not_interested: 'Sem interesse',
  won: 'Fechou',
  lost: 'Perdido',
};

const SITE_BADGE: Record<WebsiteStatus, { label: string; tone: 'red' | 'amber' | 'green' | 'blue' | 'default' }> = {
  none: { label: 'Sem site', tone: 'red' },
  instagram: { label: 'Só Instagram', tone: 'amber' },
  linktree: { label: 'Linktree', tone: 'amber' },
  own: { label: 'Site próprio', tone: 'green' },
  unknown: { label: 'Indefinido', tone: 'default' },
};

const SITE_ICON: Record<WebsiteStatus, typeof Globe> = {
  none: PhoneOff, instagram: AtSign, linktree: Link2, own: Globe, unknown: Globe,
};

type Tab = 'all' | 'no-site' | 'has-site';

export default function ListaDetalhe() {
  const { id } = useParams();
  const { profile } = useAuth();
  const team = useTeam();
  const [items, setItems] = useState<ListItem[]>([]);
  const [listName, setListName] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [distributing, setDistributing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const isAdmin = profile?.role === 'admin';

  const load = async () => {
    setLoading(true);
    const [{ data: list }, { data: rows }] = await Promise.all([
      supabase.from('lists').select('name').eq('id', id).single(),
      supabase
        .from('list_items')
        .select('*, business:businesses(*), assignee:profiles!list_items_assigned_to_fkey(id, full_name, role)')
        .eq('list_id', id),
    ]);
    setListName((list as { name: string })?.name ?? 'Lista');
    setItems((rows as ListItem[]) ?? []);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  const patch = async (itemId: string, fields: Partial<ListItem>) => {
    setItems((s) => s.map((it) => (it.id === itemId ? { ...it, ...fields } : it)));
    await supabase.from('list_items').update(fields).eq('id', itemId);
  };

  const setStatus = (itemId: string, call_status: CallStatus) =>
    patch(itemId, { call_status, contacted_at: call_status === 'pending' ? null : new Date().toISOString() });

  const distribute = async () => {
    if (!team.length) return;
    setDistributing(true);
    const approved = items.filter((i) => i.qualified === true);
    const updates = approved.map((it, i) => ({ id: it.id, assigned_to: team[i % team.length].id }));
    for (const u of updates) await supabase.from('list_items').update({ assigned_to: u.assigned_to }).eq('id', u.id);
    await load();
    setDistributing(false);
  };

  const counts = useMemo(() => {
    const pend = items.filter((i) => i.qualified === null).length;
    const appr = items.filter((i) => i.qualified === true).length;
    const rej = items.filter((i) => i.qualified === false).length;
    const analysisPending = items.filter(
      (i) => i.business?.website_status === 'own' && !Object.keys(i.business.analysis?.checks ?? {}).length,
    ).length;
    return { pend, appr, rej, analysisPending, distributed: items.filter((i) => i.assigned_to).length };
  }, [items]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      for (let guard = 0; guard < 20; guard++) {
        const r = await analyzePending(id!);
        await load();
        if (r.remaining <= 0 || r.analyzed === 0) break;
      }
    } catch { /* silencioso — o parecer é opcional */ }
    setAnalyzing(false);
  };

  const visible = useMemo(() => {
    let v = items;
    if (tab === 'no-site') v = v.filter((i) => i.business && i.business.website_status !== 'own');
    if (tab === 'has-site') v = v.filter((i) => i.business?.website_status === 'own');
    return [...v].sort((a, b) => {
      // não avaliados primeiro, depois por score
      const qa = a.qualified === null ? 0 : 1;
      const qb = b.qualified === null ? 0 : 1;
      if (qa !== qb) return qa - qb;
      return (b.business?.analysis?.score ?? 0) - (a.business?.analysis?.score ?? 0);
    });
  }, [items, tab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'no-site', label: 'Sem site' },
    { key: 'has-site', label: 'Com site' },
  ];

  return (
    <div>
      <Link to="/admin/listas" className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">
        <ArrowLeft size={14} /> Listas
      </Link>
      <PageHeader
        title={listName}
        subtitle={`${items.length} empresas · ${counts.pend} a qualificar · ${counts.appr} aprovadas · ${counts.rej} rejeitadas`}
        actions={
          <>
            {counts.analysisPending > 0 && (
              <Btn variant="outline" onClick={runAnalysis} disabled={analyzing}>
                <Sparkles size={14} />
                {analyzing ? 'Analisando...' : `Analisar ${counts.analysisPending} sites`}
              </Btn>
            )}
            {isAdmin && counts.appr > 0 && (
              <Btn onClick={distribute} disabled={distributing}>
                <Users size={14} /> {distributing ? 'Distribuindo...' : `Distribuir ${counts.appr} aprovadas`}
              </Btn>
            )}
          </>
        }
      />

      <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest ${
              tab === t.key ? 'bg-[#fe0000] text-white' : 'text-white/45'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-white/40">Carregando…</p>
      ) : (
        <div className="grid gap-3">
          {visible.map((it) => {
            const b = it.business!;
            const sb = SITE_BADGE[b.website_status];
            const Icon = SITE_ICON[b.website_status];
            return (
              <Card
                key={it.id}
                className={`p-5 ${it.qualified === false ? 'opacity-50' : ''} ${
                  it.qualified === true ? 'border-emerald-500/30' : ''
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{b.name}</h3>
                      <Badge tone={sb.tone}>
                        <Icon size={10} className="mr-1 inline" /> {sb.label}
                      </Badge>
                      {b.analysis && b.website_status === 'own' && (
                        <span className="inline-flex items-center gap-1 text-xs text-white/50">
                          <Star size={12} className="text-[#fe0000]" /> {b.analysis.score.toFixed(1)}/10
                        </span>
                      )}
                      {it.qualified === true && <Badge tone="green">Aprovada</Badge>}
                      {it.assignee && <Badge tone="blue">{it.assignee.full_name.split(' ')[0]}</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-white/45">
                      {[b.category, b.city, b.uf, b.country !== 'Brasil' ? b.country : null].filter(Boolean).join(' · ')}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      {b.phone && (
                        <a href={`tel:${b.phone}`} className="inline-flex items-center gap-1.5 text-sm text-white/80">
                          <Phone size={13} /> {b.phone}
                        </a>
                      )}
                      {b.website && (
                        <a href={b.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-sky-400">
                          <Globe size={12} /> abrir site
                        </a>
                      )}
                    </div>
                    {b.analysis?.verdict && (
                      <p className="mt-2 max-w-xl text-xs italic text-white/50">"{b.analysis.verdict}"</p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {it.qualified === null ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => patch(it.id, { qualified: true })}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25"
                        >
                          <Check size={13} /> Aprovar
                        </button>
                        <button
                          onClick={() => patch(it.id, { qualified: false })}
                          className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white/50 hover:bg-white/10"
                        >
                          <X size={13} /> Rejeitar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => patch(it.id, { qualified: null, assigned_to: null })}
                        className="text-[11px] font-bold uppercase tracking-widest text-white/35 hover:text-white"
                      >
                        {it.qualified ? 'aprovada' : 'rejeitada'} · desfazer
                      </button>
                    )}

                    {it.qualified === true && (
                      <div className="flex flex-wrap justify-end gap-2">
                        {isAdmin && (
                          <select
                            value={it.assigned_to ?? ''}
                            onChange={(e) => patch(it.id, { assigned_to: e.target.value || null })}
                            className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white"
                          >
                            <option value="" className="bg-[#161616]">— sem dono —</option>
                            {team.map((s) => (
                              <option key={s.id} value={s.id} className="bg-[#161616]">{s.full_name}</option>
                            ))}
                          </select>
                        )}
                        <select
                          value={it.call_status}
                          onChange={(e) => setStatus(it.id, e.target.value as CallStatus)}
                          className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white"
                        >
                          {Object.entries(CALL_LABELS).map(([k, v]) => (
                            <option key={k} value={k} className="bg-[#161616]">{v}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          {!visible.length && <p className="text-sm text-white/35">Nada nesta aba.</p>}
        </div>
      )}
    </div>
  );
}
