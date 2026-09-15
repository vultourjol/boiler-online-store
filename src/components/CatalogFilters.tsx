"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import type { BrandCountryGroup } from "@/db/queries";

type Category = { id: number; name: string; slug: string; icon: string };
type Bounds = { min: number; max: number };
type Range = { from: number; to: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readRange(searchParams: URLSearchParams, keyMin: string, keyMax: string, bounds: Bounds): Range {
  const rawFrom = searchParams.get(keyMin);
  const rawTo = searchParams.get(keyMax);
  const from = rawFrom !== null && rawFrom !== "" ? Number(rawFrom) : NaN;
  const to = rawTo !== null && rawTo !== "" ? Number(rawTo) : NaN;
  return {
    from: Number.isFinite(from) ? clamp(from, bounds.min, bounds.max) : bounds.min,
    to: Number.isFinite(to) ? clamp(to, bounds.min, bounds.max) : bounds.max,
  };
}

export function CatalogFilters({
  categories,
  brandGroups,
  fuelTypes,
  priceBounds,
  powerBounds,
  heatingBounds,
  hopperBounds,
  smokeDiameters,
  burners,
}: {
  categories: Category[];
  brandGroups: BrandCountryGroup[];
  fuelTypes: string[];
  priceBounds: Bounds;
  powerBounds: Bounds;
  heatingBounds: Bounds;
  hopperBounds: Bounds;
  smokeDiameters: string[];
  burners: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const selectedCategories = searchParams.getAll("category");
  const selectedBrands = searchParams.getAll("brand");
  const selectedFuel = searchParams.getAll("fuel");
  const inStockOnly = searchParams.get("inStock") === "1";

  const [price, setPrice] = useState(() => readRange(searchParams, "priceMin", "priceMax", priceBounds));
  const [power, setPower] = useState(() => readRange(searchParams, "powerMin", "powerMax", powerBounds));
  const [heating, setHeating] = useState(() => readRange(searchParams, "heatMin", "heatMax", heatingBounds));
  const [hopper, setHopper] = useState(() => readRange(searchParams, "hopperMin", "hopperMax", hopperBounds));

  function buildParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    startTransition(() => {
      router.push(`/catalog?${params.toString()}`);
    });
  }

  function toggleMulti(key: string, value: string) {
    buildParams((params) => {
      const values = params.getAll(key);
      params.delete(key);
      if (values.includes(value)) {
        values.filter((v) => v !== value).forEach((v) => params.append(key, v));
      } else {
        [...values, value].forEach((v) => params.append(key, v));
      }
    });
  }

  function setSelect(key: string, value: string) {
    buildParams((params) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
  }

  function commitRange(keyMin: string, keyMax: string, current: Range, bounds: Bounds) {
    buildParams((params) => {
      if (current.from > bounds.min) params.set(keyMin, String(current.from));
      else params.delete(keyMin);
      if (current.to < bounds.max) params.set(keyMax, String(current.to));
      else params.delete(keyMax);
    });
  }

  function toggleInStock() {
    buildParams((params) => {
      if (params.get("inStock") === "1") params.delete("inStock");
      else params.set("inStock", "1");
    });
  }

  function resetAll() {
    setPrice({ from: priceBounds.min, to: priceBounds.max });
    setPower({ from: powerBounds.min, to: powerBounds.max });
    setHeating({ from: heatingBounds.min, to: heatingBounds.max });
    setHopper({ from: hopperBounds.min, to: hopperBounds.max });
    router.push("/catalog");
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedFuel.length > 0 ||
    inStockOnly ||
    Boolean(searchParams.get("priceMin")) ||
    Boolean(searchParams.get("priceMax")) ||
    Boolean(searchParams.get("powerMin")) ||
    Boolean(searchParams.get("powerMax")) ||
    Boolean(searchParams.get("heatMin")) ||
    Boolean(searchParams.get("heatMax")) ||
    Boolean(searchParams.get("hopperMin")) ||
    Boolean(searchParams.get("hopperMax")) ||
    Boolean(searchParams.get("smoke")) ||
    Boolean(searchParams.get("burner")) ||
    Boolean(searchParams.get("gsm")) ||
    Boolean(searchParams.get("lambda")) ||
    Boolean(searchParams.get("autotype")) ||
    Boolean(searchParams.get("circuits")) ||
    Boolean(searchParams.get("ash")) ||
    Boolean(searchParams.get("autoClean")) ||
    Boolean(searchParams.get("loading")) ||
    Boolean(searchParams.get("wood"));

  return (
    <aside className="w-full shrink-0 lg:w-72">
      <div className="border border-graphite-700/10 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-graphite-950">Фильтры</h3>
          {hasActiveFilters && (
            <button
              onClick={resetAll}
              className="text-xs uppercase tracking-[0.1em] text-brand-red-700 hover:text-brand-red-800"
            >
              Сбросить
            </button>
          )}
        </div>

        <FilterSection title="Категория">
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <label key={cat.id} className="flex cursor-pointer items-center gap-2 text-sm text-graphite-700">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.slug)}
                  onChange={() => toggleMulti("category", cat.slug)}
                  className="h-4 w-4 accent-[#8b0000]"
                />
                <span>{cat.icon} {cat.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Производители">
          <div className="flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
            {brandGroups.map((group) => (
              <div key={group.country}>
                <div className="mb-1.5 text-[11px] uppercase tracking-[0.08em] text-graphite-500">
                  {group.country}
                </div>
                <div className="flex flex-col gap-1.5 pl-2">
                  {group.brands.map((brand) => (
                    <label key={brand} className="flex cursor-pointer items-center gap-2 text-sm text-graphite-700">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleMulti("brand", brand)}
                        className="h-4 w-4 accent-[#8b0000]"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Тип топлива">
          <div className="flex flex-col gap-2">
            {fuelTypes.map((fuel) => (
              <label key={fuel} className="flex cursor-pointer items-center gap-2 text-sm text-graphite-700">
                <input
                  type="checkbox"
                  checked={selectedFuel.includes(fuel)}
                  onChange={() => toggleMulti("fuel", fuel)}
                  className="h-4 w-4 accent-[#8b0000]"
                />
                <span>{fuel}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Цена, ₽">
          <RangeSlider
            bounds={priceBounds}
            value={price}
            onChange={setPrice}
            onCommit={() => commitRange("priceMin", "priceMax", price, priceBounds)}
            format={(v) => v.toLocaleString("ru-RU")}
          />
        </FilterSection>

        <FilterSection title="Мощность, кВт">
          <RangeSlider
            bounds={powerBounds}
            value={power}
            onChange={setPower}
            onCommit={() => commitRange("powerMin", "powerMax", power, powerBounds)}
            unit=" кВт"
          />
        </FilterSection>

        <FilterSection title="Площадь отопления, м²">
          <RangeSlider
            bounds={heatingBounds}
            value={heating}
            onChange={setHeating}
            onCommit={() => commitRange("heatMin", "heatMax", heating, heatingBounds)}
            unit=" м²"
          />
        </FilterSection>

        <FilterSection title="Бункер для топлива, л">
          <RangeSlider
            bounds={hopperBounds}
            value={hopper}
            onChange={setHopper}
            onCommit={() => commitRange("hopperMin", "hopperMax", hopper, hopperBounds)}
            unit=" л"
          />
        </FilterSection>

        <FilterSection title="Диаметр дымохода">
          <SelectFilter
            placeholder="Любой диаметр"
            value={searchParams.get("smoke") ?? ""}
            onChange={(v) => setSelect("smoke", v)}
            options={smokeDiameters.map((d) => ({ value: d, label: `${d} мм` }))}
          />
        </FilterSection>

        <FilterSection title="Горелка">
          <SelectFilter
            placeholder="Любая горелка"
            value={searchParams.get("burner") ?? ""}
            onChange={(v) => setSelect("burner", v)}
            options={burners.map((b) => ({ value: b, label: b }))}
          />
        </FilterSection>

        <FilterSection title="GSM-модуль">
          <YesNoSelect value={searchParams.get("gsm") ?? ""} onChange={(v) => setSelect("gsm", v)} />
        </FilterSection>

        <FilterSection title="Лямбда-зонд">
          <YesNoSelect value={searchParams.get("lambda") ?? ""} onChange={(v) => setSelect("lambda", v)} />
        </FilterSection>

        <FilterSection title="Авторозжиг">
          <YesNoSelect value={searchParams.get("autotype") ?? ""} onChange={(v) => setSelect("autotype", v)} />
        </FilterSection>

        <FilterSection title="Количество контуров">
          <SelectFilter
            placeholder="Любое"
            value={searchParams.get("circuits") ?? ""}
            onChange={(v) => setSelect("circuits", v)}
            options={[
              { value: "1", label: "1 контур (отопление)" },
              { value: "2", label: "2 контура (отопление + ГВС)" },
            ]}
          />
        </FilterSection>

        <FilterSection title="Автоматическое золоудаление">
          <YesNoSelect value={searchParams.get("ash") ?? ""} onChange={(v) => setSelect("ash", v)} />
        </FilterSection>

        <FilterSection title="Автоочистка теплообменника">
          <YesNoSelect value={searchParams.get("autoClean") ?? ""} onChange={(v) => setSelect("autoClean", v)} />
        </FilterSection>

        <FilterSection title="Вид загрузки топлива">
          <SelectFilter
            placeholder="Любая загрузка"
            value={searchParams.get("loading") ?? ""}
            onChange={(v) => setSelect("loading", v)}
            options={[
              { value: "Автоматическая", label: "Автоматическая" },
              { value: "Ручная", label: "Ручная" },
            ]}
          />
        </FilterSection>

        <FilterSection title="Работа на дровах">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-graphite-700">
            <input
              type="checkbox"
              checked={searchParams.get("wood") === "1"}
              onChange={() => setSelect("wood", searchParams.get("wood") === "1" ? "" : "1")}
              className="h-4 w-4 accent-[#8b0000]"
            />
            <span>Только модели на дровах</span>
          </label>
        </FilterSection>

        <div className="mt-6 flex items-center justify-between border-t border-graphite-100 pt-5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-graphite-700">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={toggleInStock}
              className="h-4 w-4 accent-[#8b0000]"
            />
            <span>Только в наличии</span>
          </label>
        </div>

        <button
          onClick={resetAll}
          className="mt-6 w-full bg-graphite-950 py-3 text-sm uppercase tracking-[0.1em] text-white transition-colors hover:bg-brand-red-800"
        >
          Сбросить фильтры
        </button>
      </div>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6 border-t border-graphite-100 pt-5 first:mt-5 first:border-t-0 first:pt-0">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-graphite-500">
        {title}
      </h4>
      {children}
    </div>
  );
}

function RangeSlider({
  bounds,
  value,
  onChange,
  onCommit,
  unit = "",
  format,
}: {
  bounds: Bounds;
  value: Range;
  onChange: (value: Range) => void;
  onCommit: () => void;
  unit?: string;
  format?: (value: number) => string;
}) {
  const fmt = format ?? ((v: number) => String(v));
  const pct = (v: number) => ((v - bounds.min) / (bounds.max - bounds.min)) * 100;
  const fromPct = pct(value.from);
  const toPct = pct(value.to);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-graphite-600">
        <span>от {fmt(value.from)}{unit}</span>
        <span>до {fmt(value.to)}{unit}</span>
      </div>
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-graphite-100" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-red-700"
          style={{ left: `${fromPct}%`, width: `${Math.max(0, toPct - fromPct)}%` }}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={1}
          value={value.from}
          onChange={(e) => onChange({ from: clamp(Number(e.target.value), bounds.min, value.to - 1), to: value.to })}
          onPointerUp={onCommit}
          onKeyUp={onCommit}
          className="dual-range absolute inset-0 z-10 h-full w-full"
          aria-label="Минимум"
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={1}
          value={value.to}
          onChange={(e) => onChange({ from: value.from, to: clamp(Number(e.target.value), value.from + 1, bounds.max) })}
          onPointerUp={onCommit}
          onKeyUp={onCommit}
          className="dual-range absolute inset-0 h-full w-full"
          aria-label="Максимум"
        />
      </div>
    </div>
  );
}

function SelectFilter({
  placeholder,
  value,
  onChange,
  options,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-graphite-700/20 bg-white px-3 py-2 text-sm text-graphite-950 outline-none focus:border-brand-red-700"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function YesNoSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-graphite-700/20 bg-white px-3 py-2 text-sm text-graphite-950 outline-none focus:border-brand-red-700"
    >
      <option value="">Любое</option>
      <option value="1">Есть</option>
      <option value="0">Нет</option>
    </select>
  );
}