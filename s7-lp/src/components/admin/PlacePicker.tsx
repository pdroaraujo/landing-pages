import { useEffect, useMemo, useState } from 'react';
import { loadBrCities, loadCountries, worldCountries, UF_OPTIONS, type BrCity, type Country, type Place } from '../../lib/places';
import { Field, inputClass } from './ui';
import Select from './Select';

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
  const countryOptions = useMemo(
    () => [{ value: 'BR', label: 'Brasil' }, ...world.map((c) => ({ value: c.cc, label: c.n }))],
    [world],
  );
  const cityOptions = useMemo(
    () =>
      value.uf
        ? brCities
            .filter((c) => c.uf === value.uf)
            .sort((a, b) => a.n.localeCompare(b.n, 'pt'))
            .map((c) => ({ value: c.n, label: c.n }))
        : [],
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
        <Select value={value.countryCode} onChange={setCountry} options={countryOptions} disabled={disabled} searchable />
      </Field>
      {isBr && (
        <Field label="Estado">
          <Select
            value={value.uf}
            onChange={(uf) => onChange({ ...value, uf, city: '' })}
            options={UF_OPTIONS}
            placeholder="Escolha o estado"
            disabled={disabled}
            searchable
          />
        </Field>
      )}
      <Field label="Cidade">
        {isBr ? (
          <Select
            value={value.city}
            onChange={(city) => onChange({ ...value, city })}
            options={cityOptions}
            placeholder={value.uf ? 'Escolha a cidade' : 'Escolha o estado antes'}
            disabled={disabled || !value.uf}
            searchable
          />
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
