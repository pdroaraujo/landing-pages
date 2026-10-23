import { useEffect, useMemo, useState } from 'react';
import { Printer, PackagePlus, PackageCheck, PackageX, SlidersHorizontal, Trash2, Layers } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { brl, fullDate, num } from '../../lib/format';
import { Card, PageHeader, Btn, Field, inputClass, Badge } from '../../components/admin/ui';
import Select from '../../components/admin/Select';
import S7CardBulkForm from '../../components/admin/S7CardBulkForm';

type Kind = 'envio' | 'retirada' | 'perda' | 'ajuste';
type Mov = {
  id: string;
  kind: Kind;
  quantity: number;
  grafica: string;
  item: string;
  unit_cost: number | null;
  happened_at: string;
  notes: string | null;
};

const KIND: Record<Kind, { label: string; hint: string; tone: 'blue' | 'green' | 'red' | 'default'; sign: 1 | -1 | 0; icon: typeof PackagePlus }> = {
  envio: { label: 'Envio pra gráfica', hint: 'Tags que entregamos ou compramos pela gráfica', tone: 'blue', sign: 1, icon: PackagePlus },
  retirada: { label: 'Retirada', hint: 'Placas prontas que pegamos de volta', tone: 'green', sign: -1, icon: PackageCheck },
  perda: { label: 'Perda / defeito', hint: 'Tags que estragaram na gráfica', tone: 'red', sign: -1, icon: PackageX },
  ajuste: { label: 'Ajuste de contagem', hint: 'Corrige o saldo após conferir (pode ser negativo)', tone: 'default', sign: 0, icon: SlidersHorizontal },
};

/** quanto cada movimento mexe no saldo que está com a gráfica */
const effect = (m: Pick<Mov, 'kind' | 'quantity'>) => (KIND[m.kind].sign === 0 ? m.quantity : KIND[m.kind].sign * Math.abs(m.quantity));

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = { kind: 'envio' as Kind, quantity: '', grafica: '', item: 'Tag NFC', unit_cost: '', happened_at: today(), notes: '' };

export default function S7CardGrafica() {
  const { s7Full } = useAuth();
  const [movs, setMovs] = useState<Mov[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [afterPickup, setAfterPickup] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('s7card_grafica_movs').select('*').order('happened_at', { ascending: false }).order('created_at', { ascending: false });
    setMovs((data as Mov[]) ?? []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const graficas = useMemo(() => [...new Set(movs.map((m) => m.grafica))].sort(), [movs]);
  const visible = filter ? movs.filter((m) => m.grafica === filter) : movs;

  const m = useMemo(() => {
    const sum = (k: Kind) => visible.filter((x) => x.kind === k).reduce((a, x) => a + Math.abs(x.quantity), 0);
    const saldo = visible.reduce((a, x) => a + effect(x), 0);
    const gasto = visible.filter((x) => x.kind === 'envio' && x.unit_cost).reduce((a, x) => a + Math.abs(x.quantity) * Number(x.unit_cost), 0);
    // saldo por gráfica (pra quando tiver mais de uma)
    const porGrafica = graficas
      .map((g) => ({ g, saldo: movs.filter((x) => x.grafica === g).reduce((a, x) => a + effect(x), 0) }))
      .filter((x) => x.saldo !== 0);
    return { saldo, enviadas: sum('envio'), retiradas: sum('retirada'), perdas: sum('perda'), gasto, porGrafica };
  }, [visible, movs, graficas]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(form.quantity);
    if (!q || (form.kind !== 'ajuste' && q < 0)) {
      setErr(form.kind === 'ajuste' ? 'Informe a quantidade (use negativo pra diminuir).' : 'Informe uma quantidade maior que zero.');
      return;
    }
    if (form.kind !== 'envio' && form.kind !== 'ajuste' && q > m.saldo && !filter) {
      if (!confirm(`O saldo na gráfica é ${m.saldo}. Registrar ${q} mesmo assim? (o saldo vai ficar negativo)`)) return;
    }
    setSaving(true);
    setErr(null);
    const { error } = await supabase.from('s7card_grafica_movs').insert({
      kind: form.kind,
      quantity: form.kind === 'ajuste' ? q : Math.abs(q),
      grafica: form.grafica.trim() || 'Gráfica',
      item: form.item.trim() || 'Tag NFC',
      unit_cost: form.kind === 'envio' && form.unit_cost ? Number(form.unit_cost) : null,
      happened_at: form.happened_at,
      notes: form.notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    if (form.kind === 'retirada') setAfterPickup(Math.abs(q));
    setForm({ ...emptyForm, grafica: form.grafica, item: form.item });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Apagar esse registro? O saldo da gráfica será recalculado.')) return;
    await supabase.from('s7card_grafica_movs').delete().eq('id', id);
    load();
  };

  const info = KIND[form.kind];

  return (
    <div>
      <PageHeader
        title="Gráfica"
        subtitle="Quantas tags NFC estão com a gráfica agora: tudo que enviamos, menos o que já voltou pronto e o que se perdeu."
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-6 sm:col-span-2 xl:col-span-1">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/45">Com a gráfica agora</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#fe0000]/15 text-[#fe0000]">
              <Printer size={16} />
            </span>
          </div>
          <p className={`mt-4 text-4xl font-bold tracking-tighter ${m.saldo < 0 ? 'text-[#ff5a5a]' : ''}`}>{loading ? '—' : num(m.saldo)}</p>
          <p className="mt-1 text-xs text-white/40">{m.saldo < 0 ? 'saldo negativo: confira e faça um ajuste' : 'tags em poder da gráfica'}</p>
        </Card>
        {[
          { label: 'Enviadas', value: num(m.enviadas), sub: m.gasto ? `${brl(m.gasto)} em tags` : 'total entregue à gráfica' },
          { label: 'Retiradas prontas', value: num(m.retiradas), sub: 'voltaram como placa' },
          { label: 'Perdas / defeito', value: num(m.perdas), sub: m.enviadas ? `${((m.perdas / m.enviadas) * 100).toFixed(1)}% do enviado` : 'nenhuma' },
        ].map((s) => (
          <Card key={s.label} className="p-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/45">{s.label}</span>
            <p className="mt-4 text-3xl font-bold tracking-tighter">{loading ? '—' : s.value}</p>
            <p className="mt-1 text-xs text-white/40">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-white/40">Histórico</h2>
            {graficas.length > 1 && (
              <div className="w-56">
                <Select
                  size="sm"
                  value={filter}
                  onChange={setFilter}
                  options={[{ value: '', label: 'Todas as gráficas' }, ...graficas.map((g) => ({ value: g, label: g }))]}
                />
              </div>
            )}
          </div>

          {m.porGrafica.length > 1 && !filter && (
            <p className="mb-4 text-xs text-white/50">
              {m.porGrafica.map((x) => `${x.g}: ${num(x.saldo)}`).join(' · ')}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-white/40">Carregando…</p>
          ) : visible.length === 0 ? (
            <p className="border-y border-white/10 py-6 text-sm text-white/35">
              Nenhuma movimentação ainda. Registre o primeiro envio de tags pra gráfica ao lado.
            </p>
          ) : (
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {visible.map((mv) => {
                const k = KIND[mv.kind];
                const eff = effect(mv);
                return (
                  <li key={mv.id} className="flex items-center gap-4 py-3">
                    <span className={`w-14 shrink-0 text-right text-lg font-bold tracking-tight ${eff > 0 ? 'text-sky-400' : eff < 0 ? 'text-white/70' : 'text-white/40'}`}>
                      {eff > 0 ? '+' : ''}
                      {num(eff)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={k.tone}>{k.label}</Badge>
                        <span className="text-xs text-white/50">
                          {mv.item} · {mv.grafica} · {fullDate(mv.happened_at)}
                        </span>
                      </div>
                      {(mv.notes || mv.unit_cost) && (
                        <p className="mt-1 truncate text-xs text-white/40">
                          {mv.unit_cost ? `${brl(Number(mv.unit_cost))}/un · ` : ''}
                          {mv.notes}
                        </p>
                      )}
                    </div>
                    {s7Full && (
                      <button onClick={() => remove(mv.id)} className="rounded-lg p-2 text-white/30 hover:bg-[#fe0000]/20 hover:text-[#ff5a5a]" title="Apagar registro">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {s7Full ? (
          <Card className="self-start p-6">
            <h3 className="mb-4 font-bold tracking-tight">Registrar movimentação</h3>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(KIND) as Kind[]).map((k) => {
                  const Icon = KIND[k].icon;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setForm({ ...form, kind: k })}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition-colors ${
                        form.kind === k ? 'border-[#fe0000] bg-[#fe0000]/15 text-white' : 'border-white/10 text-white/55 hover:text-white'
                      }`}
                    >
                      <Icon size={14} /> {KIND[k].label}
                    </button>
                  );
                })}
              </div>
              <p className="-mt-1 text-xs text-white/40">{info.hint}</p>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantidade">
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className={inputClass}
                    placeholder={form.kind === 'ajuste' ? 'Ex: -3' : 'Ex: 100'}
                  />
                </Field>
                <Field label="Data">
                  <input type="date" value={form.happened_at} onChange={(e) => setForm({ ...form, happened_at: e.target.value })} className={inputClass} />
                </Field>
              </div>
              <Field label="Gráfica">
                <input
                  list="graficas"
                  value={form.grafica}
                  onChange={(e) => setForm({ ...form, grafica: e.target.value })}
                  className={inputClass}
                  placeholder="Nome da gráfica"
                />
                <datalist id="graficas">
                  {graficas.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Item">
                  <input value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} className={inputClass} placeholder="Tag NFC" />
                </Field>
                {form.kind === 'envio' && (
                  <Field label="Custo/un (R$)">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={form.unit_cost}
                      onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
                      className={inputClass}
                      placeholder="opcional"
                    />
                  </Field>
                )}
              </div>
              <Field label="Observação">
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} placeholder="Ex: lote da Royal Face" />
              </Field>
              {err && <p className="text-xs text-[#ff5a5a]">{err}</p>}
              <Btn type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Registrar'}
              </Btn>
            </form>
          </Card>
        ) : (
          <Card className="self-start p-6 text-sm text-white/50">Só o administrador e o sócio registram movimentações da gráfica.</Card>
        )}
      </div>

      {afterPickup !== null && (
        <Card className="mt-8 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-bold tracking-tight">
              <Layers size={16} className="text-[#fe0000]" /> Cadastrar as {afterPickup} placas retiradas no estoque?
            </h3>
            <button onClick={() => setAfterPickup(null)} className="text-xs text-white/40 hover:text-white">
              Agora não
            </button>
          </div>
          <S7CardBulkForm key={afterPickup} initialQuantity={afterPickup} onCreated={() => setAfterPickup(null)} />
        </Card>
      )}
    </div>
  );
}
