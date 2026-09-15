"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import type { ProductListItem } from "@/lib/types";

const POWER_OPTIONS = Array.from({ length: 10 }, (_, i) => 15 + i * 5);

export function PowerSeriesPanel({ products }: { products: ProductListItem[] }) {
  const [power, setPower] = useState(() => {
    const firstAvailable = POWER_OPTIONS.find((p) =>
      products.some((product) => product.power === p)
    );
    return firstAvailable ?? POWER_OPTIONS[0];
  });

  const matches = useMemo(
    () => products.filter((p) => p.power === power),
    [products, power]
  );

  return (
    <section className="border border-graphite-700/10 bg-white p-6 sm:p-8">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="font-display text-3xl font-semibold text-graphite-950">
          Товары из серии
        </h2>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {POWER_OPTIONS.map((option) => {
          const available = products.some((product) => product.power === option);
          const active = option === power;
          return (
            <button
              key={option}
              type="button"
              disabled={!available}
              onClick={() => setPower(option)}
              className={`px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                active
                  ? "bg-brand-red-800 text-white"
                  : available
                  ? "border border-graphite-700/25 text-graphite-700 hover:border-brand-red-700 hover:text-brand-red-700"
                  : "border border-graphite-700/10 text-graphite-300"
              }`}
            >
              {option} кВт
            </button>
          );
        })}
      </div>

      <div className="mt-8 border-t border-graphite-100 pt-8">
        {matches.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {matches.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-graphite-500">
            По выбранным фильтрам котлов мощностью {power} кВт нет
          </p>
        )}
      </div>
    </section>
  );
}