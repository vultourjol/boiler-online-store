import Link from "next/link";
import {
  getBurners,
  getBrandsByCountry,
  getCategories,
  getFilteredProducts,
  getFuelTypes,
  getHeatingAreaBounds,
  getHopperCapacityBounds,
  getPowerBounds,
  getPriceBounds,
  getSmokeDiameters,
  type ProductFilters,
} from "@/db/queries";
import { CatalogFilters } from "@/components/CatalogFilters";
import { PowerSeriesPanel } from "@/components/PowerSeriesPanel";
import { ProductCard } from "@/components/ProductCard";
import { SortSelect } from "@/components/SortSelect";

export const dynamic = "force-dynamic";

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const num = Number(raw);
  return Number.isFinite(num) ? num : undefined;
}

function toBool(value: string | string[] | undefined): boolean | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "1") return true;
  if (raw === "0") return false;
  return undefined;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const filters: ProductFilters = {
    categorySlugs: toArray(params.category),
    brands: toArray(params.brand),
    fuelTypes: toArray(params.fuel),
    minPrice: toNumber(params.priceMin),
    maxPrice: toNumber(params.priceMax),
    minPower: toNumber(params.powerMin),
    maxPower: toNumber(params.powerMax),
    inStockOnly: params.inStock === "1",
    minHeatingArea: toNumber(params.heatMin),
    maxHeatingArea: toNumber(params.heatMax),
    minHopperCapacity: toNumber(params.hopperMin),
    maxHopperCapacity: toNumber(params.hopperMax),
    smokeDiameter: (Array.isArray(params.smoke) ? params.smoke[0] : params.smoke) || undefined,
    burner: (Array.isArray(params.burner) ? params.burner[0] : params.burner) || undefined,
    gsmModule: toBool(params.gsm),
    lambdaProbe: toBool(params.lambda),
    autoIgnition: toBool(params.autotype),
    circuitCount: toNumber(params.circuits),
    autoAshRemoval: toBool(params.ash),
    autoCleanHeatExchanger: toBool(params.autoClean),
    fuelLoading: (Array.isArray(params.loading) ? params.loading[0] : params.loading) || undefined,
    worksOnWood: toBool(params.wood),
    sort: (Array.isArray(params.sort) ? params.sort[0] : params.sort) as ProductFilters["sort"],
  };

  const [
    categories,
    brandGroups,
    fuelTypes,
    priceBounds,
    powerBounds,
    heatingBounds,
    hopperBounds,
    smokeDiameters,
    burners,
    productList,
  ] = await Promise.all([
    getCategories(),
    getBrandsByCountry(),
    getFuelTypes(),
    getPriceBounds(),
    getPowerBounds(),
    getHeatingAreaBounds(),
    getHopperCapacityBounds(),
    getSmokeDiameters(),
    getBurners(),
    getFilteredProducts(filters),
  ]);

  return (
    <main className="bg-[#f6f5f3]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 lg:flex-row">
        <CatalogFilters
          categories={categories}
          brandGroups={brandGroups}
          fuelTypes={fuelTypes}
          priceBounds={priceBounds}
          powerBounds={powerBounds}
          heatingBounds={heatingBounds}
          hopperBounds={hopperBounds}
          smokeDiameters={smokeDiameters}
          burners={burners}
        />

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-graphite-700/10 pb-4">
            <span className="text-sm text-graphite-500">
              Найдено: <strong className="text-graphite-950">{productList.length}</strong>
            </span>
            <SortSelect />
          </div>

          {productList.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <span className="text-5xl">🔍</span>
              <h3 className="font-display text-2xl font-semibold text-graphite-950">
                По вашим фильтрам ничего не найдено
              </h3>
              <p className="max-w-sm text-sm text-graphite-500">
                Попробуйте изменить параметры фильтрации или сбросить их.
              </p>
              <Link
                href="/catalog"
                className="mt-2 inline-flex bg-brand-red-800 px-6 py-3 text-sm uppercase tracking-[0.1em] text-white hover:bg-brand-red-700"
              >
                Сбросить фильтры
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {productList.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <PowerSeriesPanel products={productList} />
      </section>
    </main>
  );
}
