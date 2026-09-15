import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/db/queries";
import { formatPower, formatPrice } from "@/lib/format";
import type { TechnicalSpecs } from "@/lib/types";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CompareButton } from "@/components/CompareButton";
import { ProductGallery } from "@/components/ProductGallery";
import { ReviewsSection } from "@/components/ReviewsSection";
import { ProductCard } from "@/components/ProductCard";
import { ReserveButton } from "@/components/ReserveButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product.categoryId, product.id, 3);

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(100 - (product.price / product.oldPrice) * 100)
      : null;

  const specs = product.specs ?? ({} as TechnicalSpecs);

  const specRows = [
    { label: "Вид котла", value: specs.boilerType ?? "—" },
    { label: "Бренд", value: product.brand },
    { label: "Название серии котлов", value: specs.series ?? "—" },
    { label: "Мощность", value: formatPower(product.power) },
    { label: "Площадь отопления", value: specs.heatingArea ?? "—" },
    { label: "Тип отопления", value: specs.heatingType ?? "—" },
    { label: "Вид загрузки топлива", value: specs.fuelLoading ?? "—" },
    { label: "Топливо при автоматической подаче", value: specs.autoFuel ?? "—" },
    { label: "Топливо при ручной загрузке", value: specs.manualFuel ?? "—" },
    { label: "Авторозжиг", value: specs.autoIgnition ?? "—" },
    { label: "Лямбда-зонд", value: specs.lambdaProbe ?? "—" },
    { label: "Золоудаление", value: specs.ashRemoval ?? "—" },
    { label: "Ёмкость стандартного бункера/топки", value: specs.hopperCapacity ?? "—" },
    { label: "Тип бункера", value: specs.hopperType ?? "—" },
    { label: "Тип контура", value: specs.circuitType ?? "—" },
    { label: "Теплообменник", value: specs.heatExchanger ?? "—" },
  ];

  return (
    <main className="bg-[#f6f5f3]">
      <div className="mx-auto max-w-7xl px-5 py-6 text-sm text-graphite-500 sm:px-8">
        <Link href="/" className="hover:text-brand-red-800">Главная</Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="hover:text-brand-red-800">Каталог</Link>
        <span className="mx-2">/</span>
        <Link href={`/catalog?category=${product.categorySlug}`} className="hover:text-brand-red-800">
          {product.categoryName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-graphite-950">{product.name}</span>
      </div>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-2">
        <div>
          <ProductGallery
            images={product.galleryImages?.length ? product.galleryImages : [product.imageUrl]}
            alt={product.name}
            discount={discount}
          />
          <ReviewsSection product={product} />
        </div>

        <div>
          <span className="text-xs uppercase tracking-[0.16em] text-brand-red-700">
            {product.brand} · {product.country}
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold text-graphite-950">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-1 text-brand-red-700">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 20 20"
                fill={i < Math.round(product.rating) ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={1}
                className="h-4 w-4"
              >
                <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.61.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
              </svg>
            ))}
            <span className="ml-1 text-sm text-graphite-500">{product.rating.toFixed(1)} из 5</span>
          </div>

          <div className="mt-6 space-y-4 leading-relaxed text-graphite-700">
            {product.description
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-graphite-700/10 py-6 sm:grid-cols-4">
            <Spec label="Мощность" value={formatPower(product.power)} />
            <Spec label="КПД" value={`${product.efficiencyPercent}%`} />
            <Spec label="Топливо" value={product.fuelType} />
            <Spec label="Гарантия" value={`${product.warrantyYears} лет`} />
          </div>

          <div className="mt-8">
            <h3 className="font-display text-lg font-semibold text-graphite-950">
              Технические характеристики
            </h3>
            <ul className="mt-3 divide-y divide-graphite-100 border-y border-graphite-100">
              {specRows.map((row) => (
                <li
                  key={row.label}
                  className="grid grid-cols-1 gap-1 py-2.5 text-sm sm:grid-cols-[240px_1fr] sm:gap-6"
                >
                  <span className="text-graphite-500">{row.label}</span>
                  <span className="text-graphite-950">{row.value}</span>
                </li>
              ))}
            </ul>
          </div>

          {product.features.length > 0 && (
            <div className="mt-8">
              <h3 className="font-display text-lg font-semibold text-graphite-950">
                Особенности
              </h3>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-graphite-700">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red-700" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-graphite-700/10 pt-8">
            <div>
              {product.oldPrice && (
                <div className="text-sm text-graphite-500 line-through">
                  {formatPrice(product.oldPrice)}
                </div>
              )}
              <div className="font-display text-4xl font-semibold text-graphite-950">
                {formatPrice(product.price)}
              </div>
              <div className={`mt-1 text-sm ${product.inStock ? "text-green-700" : "text-graphite-500"}`}>
                {product.inStock ? "В наличии" : "Под заказ, 2–4 недели"}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <AddToCartButton product={product} className="px-10 py-4 text-base" />
              <ReserveButton product={product} className="px-10 py-4 text-base" />
              <CompareButton product={product} className="px-10 py-4 text-base" />
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-graphite-700/10 bg-graphite-100/40 py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 className="font-display text-2xl font-semibold text-graphite-950">
              Похожие модели
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.08em] text-graphite-500">{label}</div>
      <div className="mt-1 font-display text-lg font-semibold text-graphite-950">{value}</div>
    </div>
  );
}
