"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { BrandCountryGroup } from "@/db/queries";

const NAV_LINKS = [
  { href: "/", label: "Главная" },
  { href: "/catalog", label: "Каталог" },
  { href: "/#advantages", label: "Преимущества" },
  { href: "/#contacts", label: "Контакты" },
];

export function Header({ brandGroups }: { brandGroups: BrandCountryGroup[] }) {
  const { totalCount, isHydrated } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const catalogRef = useRef<HTMLDivElement>(null);
  const isCatalogPage = pathname.startsWith("/catalog");

  useEffect(() => {
    if (!catalogOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (catalogRef.current && !catalogRef.current.contains(e.target as Node)) {
        setCatalogOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [catalogOpen]);

  useEffect(() => {
    setCatalogOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-graphite-700/60 bg-graphite-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-brand-red-700 text-lg font-display font-semibold text-brand-red-600">
            К
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-wide text-white">
              КАЛОРИЯ
            </span>
            <span className="text-[10px] uppercase tracking-[0.28em] text-graphite-300">
              Отопительные системы
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => {
            if (link.href === "/catalog") {
              return (
                <div
                  key={link.href}
                  ref={catalogRef}
                  className="relative"
                  onMouseEnter={() => {
                    if (!isCatalogPage) setCatalogOpen(true);
                  }}
                  onClick={() => {
                    if (!isCatalogPage) setCatalogOpen(true);
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      if (!isCatalogPage) e.preventDefault();
                    }}
                    className={`text-sm uppercase tracking-[0.12em] transition-colors hover:text-brand-red-600 ${
                      pathname.startsWith("/catalog") ? "text-brand-red-600" : "text-graphite-100"
                    }`}
                  >
                    Каталог
                  </Link>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`absolute -right-5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-graphite-400 transition-transform duration-200 ${
                      catalogOpen ? "rotate-180" : ""
                    } xl:block`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>

                  {catalogOpen && (
                    <div className="absolute left-1/2 top-full z-50 mt-4 w-[540px] -translate-x-full bg-white p-6 shadow-xl shadow-graphite-950/20">
                      <div className="mb-4 flex items-center justify-between border-b border-graphite-100 pb-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-graphite-500">
                          Бренды котлов
                        </span>
                        <Link
                          href="/catalog"
                          className="text-xs uppercase tracking-[0.1em] text-brand-red-700 hover:text-brand-red-800"
                        >
                          Весь каталог →
                        </Link>
                      </div>
                      <div className="grid grid-cols-3 gap-x-6">
                        {brandGroups.map((group) => (
                          <div key={group.country} className="mb-4">
                            <div className="mb-1.5 text-[11px] uppercase tracking-[0.08em] text-graphite-400">
                              {group.country}
                            </div>
                            <div className="flex flex-col">
                              {group.brands.map((brand) => (
                                <Link
                                  key={brand}
                                  href={`/catalog?brand=${encodeURIComponent(brand)}`}
                                  className="py-1 text-sm text-graphite-700 transition-colors hover:text-brand-red-700"
                                >
                                  {brand}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm uppercase tracking-[0.12em] transition-colors hover:text-brand-red-600 ${
                  pathname === link.href ? "text-brand-red-600" : "text-graphite-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="tel:+78001234567"
            className="hidden text-sm text-graphite-100 hover:text-brand-red-600 md:block"
          >
            8 (800) 123-45-67
          </a>
          <Link
            href="/cart"
            className="group relative flex items-center gap-2 rounded-sm border border-graphite-600 px-4 py-2 text-sm uppercase tracking-[0.1em] text-white transition-colors hover:border-brand-red-700 hover:text-brand-red-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.907-4.7 2.355-7.164a1.125 1.125 0 00-1.11-1.336H5.106M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            <span className="hidden sm:inline">Корзина</span>
            {isHydrated && totalCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red-700 px-1 text-xs font-semibold text-white">
                {totalCount}
              </span>
            )}
          </Link>
          <button
            aria-label="Меню"
            className="flex h-10 w-10 items-center justify-center border border-graphite-600 text-white lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col border-t border-graphite-700/60 bg-graphite-950 px-5 py-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-2 text-sm uppercase tracking-[0.12em] text-graphite-100 hover:text-brand-red-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}