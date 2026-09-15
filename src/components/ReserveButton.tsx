"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { ProductListItem } from "@/lib/types";

export function ReserveButton({
  product,
  className = "",
}: {
  product: ProductListItem;
  className?: string;
}) {
  const { addItem } = useCart();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          price: product.price,
          imageUrl: product.imageUrl,
          power: product.power,
        });
        router.push("/cart?mode=reserve");
      }}
      className={`inline-flex items-center justify-center gap-2 border border-graphite-700/30 px-5 py-3 text-sm font-medium uppercase tracking-[0.08em] text-graphite-950 transition-all duration-200 hover:border-brand-red-800 hover:text-brand-red-800 ${className}`}
    >
      Забронировать
    </button>
  );
}