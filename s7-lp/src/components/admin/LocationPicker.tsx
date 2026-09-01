import { useEffect, useMemo, useState } from 'react';
import { Field, inputClass } from './ui';
import {
  FAVORITE_CITIES,
  UFS,
  loadBrCities,
  loadCountries,
  defaultLocation,
  type BrCity,
  type Country,
  type LocationValue,
} from '../../lib/places';

export default function LocationPicker({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
}) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [brCities, setBrCities] = useState<BrCity[]>([]);

  useEffect(() => {
    loadCountries().then(setCountries);
  }, []);

  const isBR = value.countryCode === 'BR';

  useEffect(() => {
    if (isBR && !brCities.length) loadBrCities().then(setBrCities);
  }, [isBR, brCities.length]);

  const cityOptions = useMemo(() => {
    if (!isBR) return [];
    const base = value.uf ? brCities.filter((c) => c.uf === value.uf) : brCities;
    const favs = FAVORITE_CITIES.filter((f) => !value.uf || f.uf === value.uf);
    const seen = new Set(favs.map((f) => f.n));
    return [...favs, ...base.filter((c) => !seen.has(c.n))].slice(0, 900);
  }, [isBR, brCities, value.uf]);

  const setCountry = (cc: string) => {
    if (cc === 'BR') return onChange({ ...defaultLocation });
    const c = countries.find((x) => x.cc === cc);
    onChange({
      country: c?.n ?? cc,
      countryCode: cc,
      uf: '',
      city: c?.cap ?? '',
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="País">
        <select
          value={value.countryCode}
          onChange={(e) => setCountry(e.target.value)}
          className={inputClass}
        >
          <option value="BR" className="bg-[#161616]">🇧🇷 Brasil</option>
          <option disabled className="bg-[#161616]">──────────</option>
          {countries
            .filter((c) => c.cc !== 'BR')
            .map((c) => (
              <option key={c.cc} value={c.cc} className="bg-[#161616]">
                {c.n}
              </option>
            ))}
        </select>
      </Field>

      {isBR ? (
        <Field label="Estado (UF)">
          <select
            value={value.uf}
            onChange={(e) => onChange({ ...value, uf: e.target.value })}
            className={inputClass}
          >
            <option value="" className="bg-[#161616]">Todos</option>
            {UFS.map((uf) => (
              <option key={uf} value={uf} className="bg-[#161616]">{uf}</option>
            ))}
          </select>
        </Field>
      ) : (
        <div />
      )}

      <Field label="Cidade">
        <input
          list={isBR ? 'br-cities' : undefined}
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          className={inputClass}
          placeholder={isBR ? 'Ex: Santos' : 'Ex: ' + (value.city || 'capital')}
        />
        {isBR && (
          <datalist id="br-cities">
            {cityOptions.map((c) => (
              <option key={`${c.n}-${c.uf}`} value={c.n}>{c.uf}</option>
            ))}
          </datalist>
        )}
      </Field>
    </div>
  );
}

