"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ProductListItem } from "@/lib/types";

export const MAX_COMPARE = 2;
const STORAGE_KEY = "boiler-house-compare";

type Listener = () => void;

function createCompareStore() {
  let items: ProductListItem[] = [];
  let loaded = false;
  const listeners = new Set<Listener>();

  function load() {
    if (loaded) return items;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      items = raw ? (JSON.parse(raw) as ProductListItem[]) : [];
    } catch {
      items = [];
    }
    return items;
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function persist(next: ProductListItem[]) {
    items = next;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    listeners.forEach((listener) => listener());
  }

  function toggle(product: ProductListItem) {
    const exists = items.some((i) => i.id === product.id);
    const next = exists
      ? items.filter((i) => i.id !== product.id)
      : items.length >= MAX_COMPARE
      ? [...items.slice(1), product]
      : [...items, product];
    persist(next);
  }

  function removeItem(productId: number) {
    persist(items.filter((i) => i.id !== productId));
  }

  function clear() {
    persist([]);
  }

  return { subscribe, getSnapshot: load, toggle, removeItem, clear };
}

const store = createCompareStore();
const CompareContext = createContext<ReturnType<typeof createCompareStore> | null>(null);
const EMPTY: ProductListItem[] = [];

export function CompareProvider({ children }: { children: ReactNode }) {
  return <CompareContext.Provider value={store}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  const items = useSyncExternalStore(ctx.subscribe, ctx.getSnapshot, () => EMPTY);
  const toggle = useCallback((product: ProductListItem) => ctx.toggle(product), [ctx]);
  const removeItem = useCallback((productId: number) => ctx.removeItem(productId), [ctx]);
  const clear = useCallback(() => ctx.clear(), [ctx]);
  const isFull = items.length >= MAX_COMPARE;

  return useMemo(
    () => ({ items, toggle, removeItem, clear, isFull, MAX_COMPARE }),
    [items, toggle, removeItem, clear, isFull]
  );
}