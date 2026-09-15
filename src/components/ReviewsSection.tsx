"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { ProductListItem } from "@/lib/types";

type Review = {
  id: number;
  author: string;
  rating: number;
  date: string;
  text: string;
};

const SEED_REVIEWS: Review[] = [
  {
    id: -1,
    author: "Алексей М.",
    rating: 5,
    date: "12 марта 2026",
    text: "Котёл отлично справляется с отоплением дома. Монтажники установили за один день, при подключении всё показали и объяснили. Второй сезон работает без единой нареканий.",
  },
  {
    id: -2,
    author: "Ирина С.",
    rating: 5,
    date: "5 февраля 2026",
    text: "Брали с учётом консультации менеджера — подобрали мощность точно под наш дом. Расход топлива порадовал, тихий в работе, панель управления простая даже для меня.",
  },
  {
    id: -3,
    author: "Дмитрий В.",
    rating: 4,
    date: "23 января 2026",
    text: "Качественная сборка, всё надёжно. Единственное — доставка заняла чуть дольше, чем обещали, но сам товар и сервис на высоте. Рекомендую.",
  },
];

function createReviewsStore(productId: number) {
  const STORAGE_KEY = `boiler-house-reviews-${productId}`;
  let stored: Review[] = [];
  let cache: Review[] = [];
  let loaded = false;
  const listeners = new Set<() => void>();

  function load(): Review[] {
    if (loaded) return cache;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      stored = raw ? (JSON.parse(raw) as Review[]) : [];
    } catch {
      stored = [];
    }
    cache = [...stored, ...SEED_REVIEWS];
    return cache;
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function persist(next: Review[]) {
    stored = next;
    cache = [...next, ...SEED_REVIEWS];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    listeners.forEach((listener) => listener());
  }

  function add(review: Review) {
    persist([review, ...stored]);
  }

  return { subscribe, getSnapshot: load, add };
}

export function ReviewsSection({ product }: { product: ProductListItem }) {
  const [store] = useState(() => createReviewsStore(product.id));
  const reviews = useSyncExternalStore(store.subscribe, store.getSnapshot, () => SEED_REVIEWS);

  const [form, setForm] = useState({ author: "", rating: 5, text: "" });
  const [saved, setSaved] = useState(false);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  }, [reviews]);

  const averageRating = (average || product.rating).toFixed(1);

  const submit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!form.author.trim() || !form.text.trim()) return;
    store.add({
      id: Date.now(),
      author: form.author.trim(),
      rating: form.rating,
      date: new Date().toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      text: form.text.trim(),
    });
    setForm({ author: "", rating: 5, text: "" });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <section className="mt-12 border-t border-graphite-700/10 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.16em] text-brand-red-700">Отзывы</span>
          <h2 className="mt-1 font-display text-2xl font-semibold text-graphite-950">
            {product.name}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display text-3xl font-semibold text-graphite-950">
            {averageRating}
          </span>
          <div>
            <div className="flex items-center gap-0.5 text-brand-red-700">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} filled={i < Math.round(average || product.rating)} />
              ))}
            </div>
            <span className="text-xs text-graphite-500">
              {reviews.length} {plural(reviews.length, "отзыв", "отзыва", "отзывов")}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      <form onSubmit={submit} className="mt-8 border border-graphite-700/10 bg-[#f6f5f3] p-5">
        <h3 className="font-display text-lg font-semibold text-graphite-950">Оставить отзыв</h3>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            required
            placeholder="Ваше имя"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="border border-graphite-700/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-red-700"
          />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setForm({ ...form, rating: i + 1 })}
                aria-label={`Оценка ${i + 1} из 5`}
                className="p-1 text-brand-red-700"
              >
                <Star filled={i < form.rating} />
              </button>
            ))}
          </div>
        </div>

        <textarea
          required
          placeholder="Расскажите о своём опыте использования котла..."
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          rows={4}
          className="mt-3 w-full resize-y border border-graphite-700/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-red-700"
        />

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            className="bg-brand-red-800 px-6 py-3 text-sm font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-brand-red-700"
          >
            Отправить отзыв
          </button>
          {saved && <span className="text-sm text-green-700">Спасибо! Отзыв добавлен ✓</span>}
        </div>
      </form>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border border-graphite-700/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-graphite-950 font-display text-sm font-semibold text-white">
            {review.author[0]}
          </span>
          <div>
            <div className="text-sm font-medium text-graphite-950">{review.author}</div>
            <div className="text-xs text-graphite-400">{review.date}</div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-brand-red-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} filled={i < review.rating} />
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-graphite-700">{review.text}</p>
    </div>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1} className="h-4 w-4">
      <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.61.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
    </svg>
  );
}

function plural(count: number, one: string, few: string, many: string): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return many;
  if (n1 > 1 && n1 < 5) return few;
  if (n1 === 1) return one;
  return many;
}