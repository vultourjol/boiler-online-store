"use client";

import Image from "next/image";
import Link from "next/link";
import { useCompare, MAX_COMPARE } from "@/lib/compare-context";
import { formatPower, formatPrice } from "@/lib/format";
import type { ProductListItem, TechnicalSpecs } from "@/lib/types";
import { AddToCartButton } from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

type RowValue = (p: ProductListItem) => string;

const baseRows: { label: string; getValue: RowValue }[] = [
  { label: "Цена", getValue: (p) => formatPrice(p.price) },
  { label: "Мощность", getValue: (p) => formatPower(p.power) },
  { label: "КПД", getValue: (p) => `${p.efficiencyPercent}%` },
  { label: "Топливо", getValue: (p) => p.fuelType },
  { label: "Страна", getValue: (p) => p.country },
  { label: "Категория", getValue: (p) => p.categoryName },
  { label: "Гарантия", getValue: (p) => `${p.warrantyYears} лет` },
  { label: "Рейтинг", getValue: (p) => p.rating.toFixed(1) },
];

const specKeys: { label: string; key: keyof TechnicalSpecs }[] = [
  { label: "Вид котла", key: "boilerType" },
  { label: "Серия", key: "series" },
  { label: "Площадь отопления", key: "heatingArea" },
  { label: "Тип отопления", key: "heatingType" },
  { label: "Вид загрузки топлива", key: "fuelLoading" },
  { label: "Автоматическая подача", key: "autoFuel" },
  { label: "Ручная загрузка", key: "manualFuel" },
  { label: "Авторозжиг", key: "autoIgnition" },
  { label: "Лямбда-зонд", key: "lambdaProbe" },
  { label: "Золоудаление", key: "ashRemoval" },
  { label: "Бункер/топка", key: "hopperCapacity" },
  { label: "Тип бункера", key: "hopperType" },
  { label: "Тип контура", key: "circuitType" },
  { label: "Теплообменник", key: "heatExchanger" },
  { label: "Автоочистка теплообменника", key: "autoCleanHeatExchanger" },
  { label: "Горелка", key: "burner" },
  { label: "GSM-модуль", key: "gsmModule" },
  { label: "Диаметр дымохода", key: "smokeDiameter" },
];

const specRows: { label: string; getValue: RowValue }[] = specKeys.map(({ label, key }) => ({
  label,
  getValue: (p) => p.specs?.[key] || "—",
}));

const allRows = [...baseRows, ...specRows];

export default function ComparePage() {
  const { items, removeItem, clear } = useCompare();

  return (
    <main className="bg-[#f6f5f3]">
      <div className="border-b border-graphite-700/10 bg-graphite-950 py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <span className="text-xs uppercase tracking-[0.24em] text-brand-red-500">Каталог</span>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-4xl font-semibold text-white">Сравнение товаров</h1>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="text-sm uppercase tracking-[0.08em] text-graphite-400 transition-colors hover:text-brand-red-500"
              >
                Очистить список
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <span className="text-5xl">⚖️</span>
            <h3 className="font-display text-2xl font-semibold text-graphite-950">
              Список сравнения пуст
            </h3>
            <p className="max-w-md text-sm text-graphite-500">
              Добавьте до {MAX_COMPARE} товаров в сравнение — кнопка «Сравнить» есть на каждой
              карточке товара в каталоге.
            </p>
            <Link
              href="/catalog"
              className="mt-2 inline-flex bg-brand-red-800 px-6 py-3 text-sm uppercase tracking-[0.1em] text-white hover:bg-brand-red-700"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((product) => (
                <ProductColumn
                  key={product.id}
                  product={product}
                  onRemove={() => removeItem(product.id)}
                />
              ))}
              {items.length === 1 && <EmptyColumn />}
            </div>

            <div className="border border-graphite-700/10 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-3">
                <div className="border-b border-graphite-100 bg-graphite-950 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                  Характеристики
                </div>
                {items.map((product) => (
                  <div
                    key={product.id}
                    className="truncate border-b border-graphite-100 px-4 py-3 text-sm font-medium text-graphite-900"
                  >
                    {product.name}
                  </div>
                ))}
                {items.length === 1 && (
                  <div className="hidden border-b border-graphite-100 px-4 py-3 text-sm text-graphite-400 sm:block">
                    —
                  </div>
                )}
              </div>

              {allRows.map((row) => {
                const values = items.map((p) => row.getValue(p));
                const isDiff =
                  items.length === 2 &&
                  values[0] !== values[1] &&
                  !values.some((v) => v === "—" || v === "");
                return (
                  <div key={row.label} className="grid grid-cols-1 sm:grid-cols-3">
                    <div className="border-b border-graphite-100 bg-graphite-100/40 px-4 py-2.5 text-sm text-graphite-500">
                      {row.label}
                    </div>
                    {values.map((value, i) => (
                      <div
                        key={i}
                        className={`border-b border-graphite-100 px-4 py-2.5 text-sm ${
                          isDiff
                            ? "font-semibold text-brand-red-700"
                            : "text-graphite-950"
                        }`}
                      >
                        {value}
                      </div>
                    ))}
                    {items.length === 1 && (
                      <div className="border-b border-graphite-100 px-4 py-2.5 text-sm text-graphite-400">
                        —
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ProductColumn({
  product,
  onRemove,
}: {
  product: ProductListItem;
  onRemove: () => void;
}) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(100 - (product.price / product.oldPrice) * 100)
      : null;

  return (
    <div className="flex flex-col border border-graphite-700/10 bg-white">
      <div className="relative aspect-[4/3] bg-graphite-900">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, 480px"
          className="object-cover"
        />
        {discount && (
          <span className="absolute left-3 top-3 bg-brand-red-800 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white">
            -{discount}%
          </span>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label="Удалить из сравнения"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-graphite-950/80 text-white transition-colors hover:bg-brand-red-700"
        >
          ×
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-[11px] uppercase tracking-[0.14em] text-brand-red-700">
          {product.brand} · {product.categoryName}
        </span>
        <Link
          href={`/catalog/${product.slug}`}
          className="mt-1 font-display text-xl font-semibold leading-snug text-graphite-950 hover:text-brand-red-800"
        >
          {product.name}
        </Link>
        <div className="mt-3 text-xs text-graphite-500">
          {formatPower(product.power)} · КПД {product.efficiencyPercent}% · Год гарантии{" "}
          {product.warrantyYears}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-graphite-100 pt-4">
          <div>
            {product.oldPrice && (
              <div className="text-xs text-graphite-500 line-through">
                {formatPrice(product.oldPrice)}
              </div>
            )}
            <div className="font-display text-2xl font-semibold text-graphite-950">
              {formatPrice(product.price)}
            </div>
          </div>
          <Link
            href={`/catalog/${product.slug}`}
            className="text-xs uppercase tracking-[0.08em] text-graphite-600 underline underline-offset-4 hover:text-brand-red-700"
          >
            Подробнее →
          </Link>
        </div>

        <div className="mt-4">
          <AddToCartButton product={product} fullWidth />
        </div>
      </div>
    </div>
  );
}

function EmptyColumn() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-graphite-700/30 bg-white/50 px-6 py-16 text-center">
      <span className="text-4xl">➕</span>
      <p className="max-w-xs text-sm text-graphite-500">
        Добавьте второй товар для сравнения
      </p>
      <Link
        href="/catalog"
        className="mt-1 inline-flex border border-graphite-700/30 px-6 py-3 text-sm uppercase tracking-[0.1em] text-graphite-950 transition-colors hover:border-brand-red-700 hover:text-brand-red-700"
      >
        В каталог
      </Link>
    </div>
  );
}