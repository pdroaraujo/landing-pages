import { useEffect, useMemo, useState } from 'react';
import { loadBrCities, loadCountries, worldCountries, UFS, type BrCity, type Country, type Place } from '../../lib/places';
import { Field, inputClass } from './ui';

/** País -> Estado (só Brasil) -> Cidade. Fora do Brasil a cidade é texto livre (vem preenchida com a capital). */
export default function PlacePicker({
  value,
  onChange,
  disabled,
}: {
  value: Place;
  onChange: (p: Place) => void;
  disabled?: boolean;
}) {
  const [brCities, setBrCities] = useState<BrCity[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    loadBrCities().then(setBrCities);
    loadCountries().then(setCountries);
  }, []);

  const world = useMemo(() => worldCountries(countries), [countries]);
  const cities = useMemo(
    () => (value.uf ? brCities.filter((c) => c.uf === value.uf).sort((a, b) => a.n.localeCompare(b.n, 'pt')) : []),
    [brCities, value.uf],
  );
  const isBr = value.countryCode === 'BR';

  const setCountry = (cc: string) => {
    if (cc === 'BR') return onChange({ country: 'Brasil', countryCode: 'BR', uf: '', city: '' });
    const c = world.find((x) => x.cc === cc);
    onChange({ country: c?.n ?? cc, countryCode: cc, uf: '', city: c?.cap ?? '' });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Field label="País">
        <select value={value.countryCode} onChange={(e) => setCountry(e.target.value)} disabled={disabled} className={inputClass}>
          <option value="BR" className="bg-[#161616]">Brasil</option>
          {world.map((c) => (
            <option key={c.cc} value={c.cc} className="bg-[#161616]">{c.n}</option>
          ))}
        </select>
      </Field>
      {isBr && (
        <Field label="Estado">
          <select
            value={value.uf}
            onChange={(e) => onChange({ ...value, uf: e.target.value, city: '' })}
            disabled={disabled}
            className={inputClass}
          >
            <option value="" className="bg-[#161616]">Escolha o estado</option>
            {UFS.map((uf) => (
              <option key={uf} value={uf} className="bg-[#161616]">{uf}</option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Cidade">
        {isBr ? (
          <select
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            disabled={disabled || !value.uf}
            className={inputClass}
          >
            <option value="" className="bg-[#161616]">{value.uf ? 'Escolha a cidade' : 'Escolha o estado antes'}</option>
            {cities.map((c) => (
              <option key={c.n} value={c.n} className="bg-[#161616]">{c.n}</option>
            ))}
          </select>
        ) : (
          <input
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            disabled={disabled}
            className={inputClass}
            placeholder="Cidade"
          />
        )}
      </Field>
    </div>
  );
}
