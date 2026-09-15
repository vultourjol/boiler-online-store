"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const NAV_LINKS = [
  { href: "/", label: "Главная" },
  { href: "/catalog", label: "Каталог" },
  { href: "/#advantages", label: "Преимущества" },
  { href: "/#contacts", label: "Контакты" },
];

export function Header() {
  const { totalCount, isHydrated } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm uppercase tracking-[0.12em] transition-colors hover:text-brand-red-600 ${
                pathname === link.href ? "text-brand-red-600" : "text-graphite-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
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
