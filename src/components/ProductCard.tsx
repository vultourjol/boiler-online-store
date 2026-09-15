import Image from "next/image";
import Link from "next/link";
import type { ProductListItem } from "@/lib/types";
import { formatPower, formatPrice } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";
import { CompareButton } from "./CompareButton";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductListItem;
  priority?: boolean;
}) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(100 - (product.price / product.oldPrice) * 100)
      : null;

  return (
    <div className="group flex flex-col overflow-hidden border border-graphite-700/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
      <Link href={`/catalog/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-graphite-900">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-0 top-0 flex flex-col gap-1 p-3">
          {product.isFeatured && (
            <span className="bg-graphite-950/90 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white">
              Хит продаж
            </span>
          )}
          {discount && (
            <span className="bg-brand-red-800 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white">
              -{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="bg-graphite-600 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white">
              Под заказ
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-[11px] uppercase tracking-[0.14em] text-brand-red-700">
          {product.brand} · {product.categoryName}
        </span>
        <Link href={`/catalog/${product.slug}`}>
          <h3 className="mt-1 font-display text-xl font-semibold leading-snug text-graphite-950 hover:text-brand-red-800">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-graphite-500">
          <span>{formatPower(product.power)}</span>
          <span>КПД {product.efficiencyPercent}%</span>
          <span>Гарантия {product.warrantyYears} лет</span>
        </div>

        <div className="mt-4 flex items-center gap-1 text-brand-red-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              viewBox="0 0 20 20"
              fill={i < Math.round(product.rating) ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1}
              className="h-3.5 w-3.5"
            >
              <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.61.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
            </svg>
          ))}
          <span className="ml-1 text-xs text-graphite-500">{product.rating.toFixed(1)}</span>
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
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <AddToCartButton product={product} fullWidth />
          <CompareButton product={product} fullWidth />
        </div>
      </div>
    </div>
  );
}
