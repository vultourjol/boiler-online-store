"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPower, formatPrice } from "@/lib/format";
import { formatPhone, isValidPhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <CartReservationForm />
    </Suspense>
  );
}

function CartReservationForm() {
  const { items, removeItem, setQuantity, totalPrice, clear, isHydrated } = useCart();
  const searchParams = useSearchParams();
  const reserveMode = searchParams.get("mode") === "reserve";
  const [form, setForm] = useState({ name: "", phone: "", address: "", comment: "" });
  const [delivery, setDelivery] = useState("delivery");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [isReserve, setIsReserve] = useState(false);

  const deliveryFee = useMemo(() => {
    if (delivery === "pickup") return 0;
    if (delivery === "tk") return 9900;
    return totalPrice > 150000 || totalPrice === 0 ? 0 : 4900;
  }, [delivery, totalPrice]);
  const grandTotal = totalPrice + deliveryFee;

  async function handleSubmit(e: { preventDefault: () => void }, reserve = false) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setStatus("error");
      setErrorMsg("Укажите имя и телефон");
      return;
    }
    if (!isValidPhone(form.phone)) {
      setStatus("error");
      setErrorMsg("Телефон должен быть в формате +7-999-999-99-99");
      return;
    }
    if (delivery !== "pickup" && !form.address.trim()) {
      setStatus("error");
      setErrorMsg("Укажите адрес доставки");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          type: reserve ? "reserve" : "order",
          delivery,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Ошибка оформления заказа");
      }
      setOrderId(data.orderId);
      setIsReserve(reserve);
      setStatus("success");
      clear();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Ошибка оформления заказа");
    }
  }

  if (status === "success") {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-24 text-center">
        <span className="text-5xl">✓</span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-graphite-950">
          {isReserve ? `Резерв №${orderId} оформлен` : `Заказ №${orderId} принят`}
        </h1>
        <p className="mt-3 text-graphite-600">
          {isReserve
            ? "Товар зарезервирован за вами. Наш менеджер свяжется с вами в течение 15 минут для подтверждения резерва."
            : "Спасибо за заказ! Наш менеджер свяжется с вами в течение 15 минут для подтверждения деталей доставки и монтажа."}
        </p>
        <Link
          href="/catalog"
          className="mt-8 inline-flex bg-brand-red-800 px-8 py-4 text-sm uppercase tracking-[0.1em] text-white hover:bg-brand-red-700"
        >
          Продолжить покупки
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-[#f6f5f3]">
      <div className="border-b border-graphite-700/10 bg-graphite-950 py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <span className="text-xs uppercase tracking-[0.24em] text-brand-red-500">Оформление</span>
          <h1 className="mt-2 font-display text-4xl font-semibold text-white">Корзина</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {!isHydrated ? null : items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <span className="text-5xl">🛒</span>
            <h3 className="font-display text-2xl font-semibold text-graphite-950">
              Ваша корзина пуста
            </h3>
            <p className="max-w-sm text-sm text-graphite-500">
              Перейдите в каталог, чтобы подобрать отопительный котёл для вашего дома.
            </p>
            <Link
              href="/catalog"
              className="mt-2 inline-flex bg-brand-red-800 px-6 py-3 text-sm uppercase tracking-[0.1em] text-white hover:bg-brand-red-700"
            >
              В каталог
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="flex flex-col gap-4 lg:col-span-2">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col gap-4 border border-graphite-700/10 bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div className="relative h-24 w-32 shrink-0 overflow-hidden bg-graphite-900">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/catalog/${item.slug}`}
                      className="font-display text-lg font-semibold text-graphite-950 hover:text-brand-red-800"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-1 text-xs uppercase tracking-[0.1em] text-graphite-500">
                      {item.brand} · {formatPower(item.power)}
                    </div>
                    <div className="mt-2 font-display text-lg font-semibold text-graphite-950">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-graphite-700/20">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center text-graphite-700 hover:bg-graphite-100"
                      >
                        −
                      </button>
                      <span className="flex h-9 w-10 items-center justify-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center text-graphite-700 hover:bg-graphite-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      aria-label="Удалить"
                      className="flex h-9 w-9 items-center justify-center text-graphite-400 hover:text-brand-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="border border-graphite-700/10 bg-white p-6">
                <h2 className="font-display text-xl font-semibold text-graphite-950">
                  Ваш заказ
                </h2>
                <div className="mt-4 flex justify-between text-sm text-graphite-600">
                  <span>Товары</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm text-graphite-600">
                  <span>Доставка</span>
                  <span>{deliveryFee === 0 ? "Бесплатно" : formatPrice(deliveryFee)}</span>
                </div>
                <div className="mt-4 flex justify-between border-t border-graphite-100 pt-4 font-display text-xl font-semibold text-graphite-950">
                  <span>Итого</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>

                <div className="mt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-graphite-500">
                    Способ доставки
                  </h3>
                  <div className="mt-3 flex flex-col gap-2">
                    {[
                      { value: "delivery", label: "Курьером", hint: "По городу" },
                      { value: "tk", label: "Транспортная компания", hint: "По России" },
                      { value: "pickup", label: "Самовывоз", hint: "Бесплатно" },
                    ].map((option) => {
                      const fee =
                        option.value === "pickup"
                          ? 0
                          : option.value === "tk"
                          ? 9900
                          : totalPrice > 150000 || totalPrice === 0
                          ? 0
                          : 4900;
                      return (
                        <label
                          key={option.value}
                          className={`flex cursor-pointer items-center justify-between gap-2 border px-3 py-2.5 text-sm transition-colors ${
                            delivery === option.value
                              ? "border-brand-red-700 bg-brand-red-700/5"
                              : "border-graphite-700/20 hover:border-graphite-700/40"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="delivery"
                              value={option.value}
                              checked={delivery === option.value}
                              onChange={() => setDelivery(option.value)}
                              className="h-4 w-4 accent-[#8b0000]"
                            />
                            <span>
                              {option.label}{" "}
                              <span className="ml-1 text-xs text-graphite-400">{option.hint}</span>
                            </span>
                          </span>
                          <span className="text-xs text-graphite-500">
                            {fee === 0 ? "Бесплатно" : formatPrice(fee)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
                  <input
                    required
                    placeholder="Ваше имя"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="border border-graphite-700/20 px-3 py-3 text-sm outline-none focus:border-brand-red-700"
                  />
                  <input
                    required
                    inputMode="tel"
                    placeholder="+7-999-999-99-99"
                    value={form.phone}
                    maxLength={18}
                    onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                    className="border border-graphite-700/20 px-3 py-3 text-sm outline-none focus:border-brand-red-700"
                  />
                  {delivery !== "pickup" && (
                    <input
                      required
                      placeholder="Адрес доставки"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="border border-graphite-700/20 px-3 py-3 text-sm outline-none focus:border-brand-red-700"
                    />
                  )}
                  <textarea
                    placeholder="Комментарий к заказу"
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    rows={3}
                    className="border border-graphite-700/20 px-3 py-3 text-sm outline-none focus:border-brand-red-700"
                  />

                  {status === "error" && (
                    <p className="text-sm text-brand-red-700">{errorMsg}</p>
                  )}

                  <div className="mt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className={`py-4 text-sm font-medium uppercase tracking-[0.1em] transition-colors disabled:opacity-60 ${
                        reserveMode
                          ? "border border-graphite-700/30 text-graphite-600 hover:border-graphite-700/50"
                          : "bg-brand-red-800 text-white hover:bg-brand-red-700"
                      }`}
                    >
                      {status === "submitting" ? "Оформляем..." : "Оформить заказ"}
                    </button>
                    <button
                      type="button"
                      disabled={status === "submitting"}
                      onClick={(e) => handleSubmit(e, true)}
                      className={`py-4 text-sm font-medium uppercase tracking-[0.1em] transition-colors disabled:opacity-60 ${
                        reserveMode
                          ? "bg-brand-red-800 text-white hover:bg-brand-red-700"
                          : "border border-graphite-700/30 text-graphite-950 hover:border-brand-red-800 hover:text-brand-red-800"
                      }`}
                    >
                      {status === "submitting" ? "Резервируем..." : "Забронировать"}
                    </button>
                  </div>
                  <p className="text-center text-xs text-graphite-400">
                    Нажимая кнопку, вы соглашаетесь с политикой обработки данных
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
