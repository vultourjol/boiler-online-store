"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "popular", label: "По популярности" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
  { value: "power-asc", label: "По возрастанию мощности" },
  { value: "power-desc", label: "По убыванию мощности" },
];

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "popular";

  return (
    <select
      value={current}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", e.target.value);
        router.push(`/catalog?${params.toString()}`);
      }}
      className="border border-graphite-700/20 bg-white px-3 py-2 text-sm text-graphite-800 outline-none focus:border-brand-red-700"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
