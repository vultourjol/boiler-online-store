"use client";

import { useCompare } from "@/lib/compare-context";
import type { ProductListItem } from "@/lib/types";

export function CompareButton({
  product,
  className = "",
  fullWidth = false,
}: {
  product: ProductListItem;
  className?: string;
  fullWidth?: boolean;
}) {
  const { items, toggle } = useCompare();
  const active = items.some((i) => i.id === product.id);
  const disabled = !active && items.length >= 2;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        toggle(product);
      }}
      className={`${fullWidth ? "w-full" : ""} inline-flex items-center justify-center gap-2 border px-3 py-3 text-xs font-medium uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-brand-red-700 bg-brand-red-700/5 text-brand-red-700 hover:bg-brand-red-700 hover:text-white"
          : "border-graphite-700/30 text-graphite-600 hover:border-brand-red-700 hover:text-brand-red-700"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-4 w-4"
      >
        <path d="M8 3L4 7l4 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 7h12" strokeLinecap="round" />
        <path d="M16 21l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 17H8" strokeLinecap="round" />
      </svg>
      {active ? "В сравнении" : "Сравнить"}
    </button>
  );
}