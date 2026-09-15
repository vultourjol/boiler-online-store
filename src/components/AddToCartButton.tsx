"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { ProductListItem } from "@/lib/types";

export function AddToCartButton({
  product,
  className = "",
  fullWidth = false,
}: {
  product: ProductListItem;
  className?: string;
  fullWidth?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={!product.inStock}
      onClick={(e) => {
        e.preventDefault();
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          price: product.price,
          imageUrl: product.imageUrl,
          power: product.power,
        });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
      className={`${fullWidth ? "w-full" : ""} inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 text-sm font-medium uppercase tracking-[0.08em] transition-all duration-200 ${
        !product.inStock
          ? "cursor-not-allowed bg-graphite-300 text-graphite-600"
          : added
          ? "bg-graphite-800 text-white"
          : "bg-brand-red-800 text-white hover:bg-brand-red-700"
      } ${className}`}
    >
      {!product.inStock ? "Нет в наличии" : added ? "Добавлено ✓" : "В корзину"}
    </button>
  );
}
