import type { ProspectSource } from '../../lib/types';

const opts: { key: ProspectSource; label: string; hint: string }[] = [
  { key: 'osm', label: 'OpenStreetMap', hint: 'grátis' },
  { key: 'apify', label: 'Google Maps', hint: 'Apify · consome crédito' },
];

export default function SourceToggle({
  value,
  onChange,
  disabled,
}: {
  value: ProspectSource;
  onChange: (s: ProspectSource) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
      {opts.map((o) => (
        <button
          key={o.key}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.key)}
          className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${
            value === o.key ? 'bg-[#fe0000] text-white' : 'text-white/45 hover:text-white'
          }`}
          title={o.hint}
        >
          {o.label}
          <span className="ml-1.5 font-normal normal-case tracking-normal opacity-60">({o.hint})</span>
        </button>
      ))}
    </div>
  );
}
