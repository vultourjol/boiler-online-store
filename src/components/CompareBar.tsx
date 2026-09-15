"use client";

import Image from "next/image";
import Link from "next/link";
import { useCompare } from "@/lib/compare-context";
import { formatPrice } from "@/lib/format";

export function CompareBar() {
  const { items, removeItem, clear } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-graphite-700/10 bg-white/95 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-8">
        <span className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-graphite-500 md:block">
          Сравнение
        </span>

        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex shrink-0 items-center gap-2 border border-graphite-700/15 bg-[#f6f5f3] px-2 py-1"
            >
              <Link
                href={`/catalog/${item.slug}`}
                className="relative h-10 w-10 shrink-0 overflow-hidden bg-graphite-900"
              >
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </Link>
              <div className="max-w-[140px]">
                <div className="truncate text-sm text-graphite-800">{item.name}</div>
                <div className="truncate text-xs text-graphite-500">
                  {formatPrice(item.price)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label="Убрать из сравнения"
                className="flex h-6 w-6 shrink-0 items-center justify-center text-graphite-400 hover:text-brand-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={clear}
          className="hidden shrink-0 text-xs uppercase tracking-[0.08em] text-graphite-400 hover:text-brand-red-700 sm:block"
        >
          Очистить
        </button>

        <Link
          href="/compare"
          className="inline-flex shrink-0 items-center gap-2 bg-brand-red-800 px-5 py-3 text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-brand-red-700"
        >
          Сравнить
          <span>{items.length}/2</span>
        </Link>
      </div>
    </div>
  );
}