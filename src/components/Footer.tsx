import Link from "next/link";

export function Footer() {
  return (
    <footer id="contacts" className="border-t border-graphite-700/60 bg-graphite-950 text-graphite-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-brand-red-700 text-lg font-display font-semibold text-brand-red-600">
              К
            </span>
            <span className="font-display text-xl font-semibold text-white">КАЛОРИЯ</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-graphite-300">
            Премиальные отопительные котлы для загородных домов. Экспертный подбор,
            официальная гарантия и профессиональный монтаж.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg text-white">Навигация</h4>
          <ul className="mt-4 space-y-2 text-sm text-graphite-300">
            <li><Link href="/" className="hover:text-brand-red-600">Главная</Link></li>
            <li><Link href="/catalog" className="hover:text-brand-red-600">Каталог котлов</Link></li>
            <li><Link href="/cart" className="hover:text-brand-red-600">Корзина</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-white">Контакты</h4>
          <ul className="mt-4 space-y-2 text-sm text-graphite-300">
            <li>8 (800) 123-45-67</li>
            <li>info@caloria-boilers.ru</li>
            <li>г. Москва, Каширское шоссе, 22</li>
            <li>Ежедневно, 9:00 — 21:00</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-white">Гарантии</h4>
          <ul className="mt-4 space-y-2 text-sm text-graphite-300">
            <li>Официальная гарантия производителя</li>
            <li>Сертифицированный монтаж</li>
            <li>Сервисное обслуживание по РФ</li>
            <li>Рассрочка 0% на 12 месяцев</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-graphite-800 py-5 text-center text-xs uppercase tracking-[0.14em] text-graphite-500">
        © {new Date().getFullYear()} Калория — премиальные системы отопления
      </div>
    </footer>
  );
}
