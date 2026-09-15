import { db, hasDatabase } from "@/db";
import { categories, products } from "@/db/schema";
import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { mockCategories, mockProducts } from "@/db/mock-data";
import type { ProductListItem } from "@/lib/types";

export type ProductFilters = {
  categorySlugs?: string[];
  brands?: string[];
  fuelTypes?: string[];
  minPrice?: number;
  maxPrice?: number;
  minPower?: number;
  maxPower?: number;
  inStockOnly?: boolean;
  minHeatingArea?: number;
  maxHeatingArea?: number;
  minHopperCapacity?: number;
  maxHopperCapacity?: number;
  smokeDiameter?: string;
  burner?: string;
  gsmModule?: boolean;
  lambdaProbe?: boolean;
  autoIgnition?: boolean;
  circuitCount?: number;
  autoAshRemoval?: boolean;
  autoCleanHeatExchanger?: boolean;
  fuelLoading?: string;
  worksOnWood?: boolean;
  sort?: "price-asc" | "price-desc" | "power-asc" | "power-desc" | "popular";
};

export type BrandCountryGroup = {
  country: string;
  brands: string[];
};

function parseFirstNumber(value: string | undefined | null): number | null {
  if (!value) return null;
  const match = value.match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(",", ".")) : null;
}

function isAutoIgnition(value: string | undefined): boolean {
  return value === "Да" || value === "Электронный";
}

function productCircuitCount(value: string | undefined): number | null {
  if (!value) return null;
  if (value.includes("Двухконтурный")) return 2;
  if (value.includes("Одноконтурный")) return 1;
  return null;
}

function productSpecMatchesSpecs(p: (typeof mockProducts)[number], filters: ProductFilters) {
  const specs = p.specs;

  const area = parseFirstNumber(specs?.heatingArea);
  if (
    filters.minHeatingArea !== undefined &&
    (area === null || area < filters.minHeatingArea)
  ) return false;
  if (
    filters.maxHeatingArea !== undefined &&
    (area === null || area > filters.maxHeatingArea)
  ) return false;

  const hopper = parseFirstNumber(specs?.hopperCapacity);
  if (
    filters.minHopperCapacity !== undefined &&
    (hopper === null || hopper < filters.minHopperCapacity)
  ) return false;
  if (
    filters.maxHopperCapacity !== undefined &&
    (hopper === null || hopper > filters.maxHopperCapacity)
  ) return false;

  if (filters.smokeDiameter && specs?.smokeDiameter !== filters.smokeDiameter) return false;
  if (filters.burner && specs?.burner !== filters.burner) return false;
  if (filters.gsmModule !== undefined && filters.gsmModule !== (specs?.gsmModule === "Да")) return false;
  if (filters.lambdaProbe !== undefined && filters.lambdaProbe !== (specs?.lambdaProbe === "Да")) return false;
  if (filters.autoIgnition !== undefined && filters.autoIgnition !== isAutoIgnition(specs?.autoIgnition)) return false;
  if (filters.circuitCount !== undefined && productCircuitCount(specs?.circuitType) !== filters.circuitCount) return false;
  if (
    filters.autoAshRemoval !== undefined &&
    filters.autoAshRemoval !== (specs?.ashRemoval?.toLowerCase().includes("автоматическ") ?? false)
  ) return false;
  if (
    filters.autoCleanHeatExchanger !== undefined &&
    filters.autoCleanHeatExchanger !== (specs?.autoCleanHeatExchanger === "Да")
  ) return false;
  if (filters.fuelLoading && specs?.fuelLoading !== filters.fuelLoading) return false;
  if (filters.worksOnWood === true && !(specs?.manualFuel?.toLowerCase().includes("дров") ?? false)) return false;
  if (filters.worksOnWood === false && (specs?.manualFuel?.toLowerCase().includes("дров") ?? false)) return false;

  return true;
}

export async function getPowerBounds() {
  const powers = mockProducts.map((p) => p.power);
  const min = Math.min(...powers);
  const max = Math.max(Math.ceil(Math.max(...powers) / 10) * 10 + 10, min + 10);
  return { min, max };
}

export async function getHeatingAreaBounds() {
  const values = mockProducts
    .map((p) => parseFirstNumber(p.specs?.heatingArea))
    .filter((v): v is number => v !== null);
  if (values.length === 0) return { min: 0, max: 100 };
  const min = Math.min(...values);
  const max = Math.max(Math.ceil(Math.max(...values) / 100) * 100 + 100, min + 100);
  return { min, max };
}

export async function getHopperCapacityBounds() {
  const values = mockProducts
    .map((p) => parseFirstNumber(p.specs?.hopperCapacity))
    .filter((v): v is number => v !== null);
  if (values.length === 0) return { min: 0, max: 100 };
  const min = Math.min(...values);
  const max = Math.max(Math.ceil(Math.max(...values) / 100) * 100 + 100, min + 100);
  return { min, max };
}

export async function getSmokeDiameters() {
  const values = new Set<string>();
  mockProducts.forEach((p) => {
    const v = p.specs?.smokeDiameter;
    if (v && v !== "—") values.add(v);
  });
  return [...values].sort((a, b) => Number(a) - Number(b));
}

export async function getBurners() {
  const values = new Set<string>();
  mockProducts.forEach((p) => {
    const v = p.specs?.burner;
    if (v && v !== "—") values.add(v);
  });
  return [...values].sort((a, b) => a.localeCompare(b, "ru"));
}

export async function getBrandsByCountry(): Promise<BrandCountryGroup[]> {
  const map = new Map<string, Set<string>>();
  mockProducts.forEach((p) => {
    const country = p.country || "Прочее";
    if (!map.has(country)) map.set(country, new Set());
    map.get(country)!.add(p.brand);
  });
  return [...map.entries()]
    .map(([country, brands]) => ({ country, brands: [...brands].sort() }))
    .sort((a, b) => a.country.localeCompare(b.country, "ru"));
}

export async function getCategories() {
  if (!hasDatabase || !db) return mockCategories;
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getCategoryBySlug(slug: string) {
  if (!hasDatabase || !db) {
    return mockCategories.find((c) => c.slug === slug) ?? null;
  }
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getFuelTypes() {
  if (!hasDatabase || !db) {
    return [...new Set(mockProducts.map((p) => p.fuelType))].sort();
  }
  const rows = await db
    .selectDistinct({ fuelType: products.fuelType })
    .from(products)
    .orderBy(asc(products.fuelType));
  return rows.map((r) => r.fuelType);
}

export async function getBrands() {
  if (!hasDatabase || !db) {
    return [...new Set(mockProducts.map((p) => p.brand))].sort();
  }
  const rows = await db
    .selectDistinct({ brand: products.brand })
    .from(products)
    .orderBy(asc(products.brand));
  return rows.map((r) => r.brand);
}

export async function getPriceBounds() {
  const padPriceMax = (value: number) =>
    Math.ceil(value / 250000) * 250000 + 250000;

  if (!hasDatabase || !db) {
    const prices = mockProducts.map((p) => p.price);
    const min = Math.floor(Math.min(...prices) / 1000) * 1000;
    return {
      min,
      max: Math.max(padPriceMax(Math.max(...prices)), min + 100000),
    };
  }
  const rows = await db
    .select({
      min: sql<number>`min(${products.price})`,
      max: sql<number>`max(${products.price})`,
    })
    .from(products);
  const min = Math.floor((rows[0]?.min ?? 0) / 1000) * 1000;
  const max = Math.max(padPriceMax(rows[0]?.max ?? 500000), min + 100000);
  return {
    min,
    max,
  };
}

export async function getFilteredProducts(filters: ProductFilters) {
  if (!hasDatabase || !db) return filterMockProducts(filters);
  const conditions = [];

  if (filters.categorySlugs && filters.categorySlugs.length > 0) {
    const catRows = await db
      .select({ id: categories.id })
      .from(categories)
      .where(inArray(categories.slug, filters.categorySlugs));
    const ids = catRows.map((c) => c.id);
    if (ids.length === 0) return [];
    conditions.push(inArray(products.categoryId, ids));
  }

  if (filters.brands && filters.brands.length > 0) {
    conditions.push(inArray(products.brand, filters.brands));
  }

  if (filters.fuelTypes && filters.fuelTypes.length > 0) {
    conditions.push(inArray(products.fuelType, filters.fuelTypes));
  }

  if (filters.minPrice !== undefined) {
    conditions.push(gte(products.price, filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(lte(products.price, filters.maxPrice));
  }
  if (filters.minPower !== undefined) {
    conditions.push(gte(products.power, filters.minPower));
  }
  if (filters.maxPower !== undefined) {
    conditions.push(lte(products.power, filters.maxPower));
  }
  if (filters.inStockOnly) {
    conditions.push(eq(products.inStock, true));
  }

  let orderBy;
  switch (filters.sort) {
    case "price-asc":
      orderBy = asc(products.price);
      break;
    case "price-desc":
      orderBy = desc(products.price);
      break;
    case "power-asc":
      orderBy = asc(products.power);
      break;
    case "power-desc":
      orderBy = desc(products.power);
      break;
    default:
      orderBy = desc(products.isFeatured);
  }

  const query = db
    .select({
      id: products.id,
      categoryId: products.categoryId,
      name: products.name,
      slug: products.slug,
      brand: products.brand,
      country: products.country,
      fuelType: products.fuelType,
      power: products.power,
      efficiencyPercent: products.efficiencyPercent,
      price: products.price,
      oldPrice: products.oldPrice,
      warrantyYears: products.warrantyYears,
      imageUrl: products.imageUrl,
      description: products.description,
      features: products.features,
      inStock: products.inStock,
      isFeatured: products.isFeatured,
      rating: products.rating,
      categorySlug: categories.slug,
      categoryName: categories.name,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy);

  return query;
}

export async function getFeaturedProducts(limit = 6) {
  return getFilteredProductsSimpleFeatured(limit);
}

async function getFilteredProductsSimpleFeatured(limit: number) {
  if (!hasDatabase || !db) {
    return mockProducts
      .filter((p) => p.isFeatured)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
  const rows = await db
    .select({
      id: products.id,
      categoryId: products.categoryId,
      name: products.name,
      slug: products.slug,
      brand: products.brand,
      country: products.country,
      fuelType: products.fuelType,
      power: products.power,
      efficiencyPercent: products.efficiencyPercent,
      price: products.price,
      oldPrice: products.oldPrice,
      warrantyYears: products.warrantyYears,
      imageUrl: products.imageUrl,
      description: products.description,
      features: products.features,
      inStock: products.inStock,
      isFeatured: products.isFeatured,
      rating: products.rating,
      categorySlug: categories.slug,
      categoryName: categories.name,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isFeatured, true))
    .orderBy(desc(products.rating))
    .limit(limit);
  return rows;
}

export async function getProductBySlug(slug: string): Promise<ProductListItem | null> {
  if (!hasDatabase || !db) {
    return mockProducts.find((p) => p.slug === slug) ?? null;
  }
  const rows = await db
    .select({
      id: products.id,
      categoryId: products.categoryId,
      name: products.name,
      slug: products.slug,
      brand: products.brand,
      country: products.country,
      fuelType: products.fuelType,
      power: products.power,
      efficiencyPercent: products.efficiencyPercent,
      price: products.price,
      oldPrice: products.oldPrice,
      warrantyYears: products.warrantyYears,
      imageUrl: products.imageUrl,
      description: products.description,
      features: products.features,
      inStock: products.inStock,
      isFeatured: products.isFeatured,
      rating: products.rating,
      categorySlug: categories.slug,
      categoryName: categories.name,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getRelatedProducts(categoryId: number, excludeId: number, limit = 3) {
  if (!hasDatabase || !db) {
    return mockProducts
      .filter((p) => p.categoryId === categoryId && p.id !== excludeId)
      .slice(0, limit);
  }
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      brand: products.brand,
      power: products.power,
      price: products.price,
      oldPrice: products.oldPrice,
      imageUrl: products.imageUrl,
      rating: products.rating,
      fuelType: products.fuelType,
      inStock: products.inStock,
      categorySlug: sql<string>`(select slug from categories where categories.id = ${products.categoryId})`,
      categoryName: sql<string>`(select name from categories where categories.id = ${products.categoryId})`,
      categoryId: products.categoryId,
      country: products.country,
      efficiencyPercent: products.efficiencyPercent,
      warrantyYears: products.warrantyYears,
      description: products.description,
      features: products.features,
      isFeatured: products.isFeatured,
    })
    .from(products)
    .where(and(eq(products.categoryId, categoryId), sql`${products.id} != ${excludeId}`))
    .limit(limit);
}

function filterMockProducts(filters: ProductFilters) {
  let list = mockProducts.slice();

  if (filters.categorySlugs && filters.categorySlugs.length > 0) {
    list = list.filter((p) => filters.categorySlugs!.includes(p.categorySlug));
  }
  if (filters.brands && filters.brands.length > 0) {
    list = list.filter((p) => filters.brands!.includes(p.brand));
  }
  if (filters.fuelTypes && filters.fuelTypes.length > 0) {
    list = list.filter((p) => filters.fuelTypes!.includes(p.fuelType));
  }
  if (filters.minPrice !== undefined) {
    list = list.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    list = list.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters.minPower !== undefined) {
    list = list.filter((p) => p.power >= filters.minPower!);
  }
  if (filters.maxPower !== undefined) {
    list = list.filter((p) => p.power <= filters.maxPower!);
  }
  if (filters.inStockOnly) {
    list = list.filter((p) => p.inStock);
  }

  list = list.filter((p) => productSpecMatchesSpecs(p, filters));

  switch (filters.sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "power-asc":
      list.sort((a, b) => a.power - b.power);
      break;
    case "power-desc":
      list.sort((a, b) => b.power - a.power);
      break;
    default:
      list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  }

  return list;
}
