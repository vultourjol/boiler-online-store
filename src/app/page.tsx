import Image from "next/image";
import Link from "next/link";
import { getCategories, getFeaturedProducts } from "@/db/queries";
import { ProductCard } from "@/components/ProductCard";
import { BoilerWizard } from "@/components/BoilerWizard";

export const dynamic = "force-dynamic";

const ADVANTAGES = [
  {
    title: "Экспертный подбор",
    text: "Инженеры рассчитают тепловую мощность и подберут котёл под площадь и особенности вашего дома.",
    icon: "01",
  },
  {
    title: "Официальная гарантия",
    text: "Работаем напрямую с производителями — гарантия до 7 лет и оригинальные комплектующие.",
    icon: "02",
  },
  {
    title: "Профессиональный монтаж",
    text: "Собственная монтажная служба с аттестацией Ростехнадзора и пусконаладкой оборудования.",
    icon: "03",
  },
  {
    title: "Сервис по всей России",
    text: "Сеть авторизованных сервисных центров для планового и гарантийного обслуживания.",
    icon: "04",
  },
];

const STEPS = [
  { n: "1", title: "Консультация", text: "Обсуждаем площадь дома, тип топлива и бюджет" },
  { n: "2", title: "Подбор оборудования", text: "Формируем список из 2–3 подходящих моделей" },
  { n: "3", title: "Доставка и монтаж", text: "Привозим и устанавливаем котёл под ключ" },
  { n: "4", title: "Гарантийное обслуживание", text: "Сопровождаем оборудование весь срок службы" },
];

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedProducts(6),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-[86vh] items-center overflow-hidden bg-graphite-950">
        <Image
          src="/images/hero.svg"
          alt="Премиальный отопительный котёл"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-graphite-950 via-graphite-950/80 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-block border border-brand-red-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-red-500">
              Отопление премиум-класса
            </span>
            <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.05] text-white text-shadow-soft">
              Тепло, достойное вашего дома
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-graphite-100">
              Подбираем, поставляем и устанавливаем отопительные котлы ведущих
              европейских и российских производителей для загородных домов
              любой площади.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-brand-red-800 px-8 py-4 text-sm font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-brand-red-700"
              >
                Перейти в каталог
              </Link>
              <a
                href="#advantages"
                className="inline-flex items-center gap-2 border border-graphite-500 px-8 py-4 text-sm font-medium uppercase tracking-[0.1em] text-white transition-colors hover:border-white"
              >
                Почему мы
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="flex flex-col gap-2 text-center">
          <span className="mx-auto text-xs uppercase tracking-[0.24em] text-brand-red-700">
            Каталог
          </span>
          <h2 className="font-display text-3xl font-semibold text-graphite-950 sm:text-4xl">
            Категории отопительных котлов
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 border border-graphite-700/10 bg-white px-4 py-8 text-center transition-all hover:-translate-y-1 hover:border-brand-red-700 hover:shadow-[0_16px_30px_rgba(0,0,0,0.08)]"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="font-display text-base font-semibold leading-tight text-graphite-950 group-hover:text-brand-red-800">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-graphite-100/40 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.24em] text-brand-red-700">
                Подборка
              </span>
              <h2 className="mt-2 font-display text-3xl font-semibold text-graphite-950 sm:text-4xl">
                Хиты продаж
              </h2>
            </div>
            <Link
              href="/catalog"
              className="text-sm uppercase tracking-[0.1em] text-graphite-950 underline decoration-brand-red-700 decoration-2 underline-offset-4 hover:text-brand-red-800"
            >
              Весь каталог →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section id="advantages" className="bg-graphite-950 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-[0.24em] text-brand-red-500">
              Наши преимущества
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
              Почему нам доверяют владельцы загородных домов
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden bg-graphite-800 sm:grid-cols-2 lg:grid-cols-4">
            {ADVANTAGES.map((a) => (
              <div key={a.title} className="flex flex-col gap-4 bg-graphite-950 p-8">
                <span className="font-display text-4xl font-semibold text-brand-red-700">
                  {a.icon}
                </span>
                <h3 className="font-display text-xl font-semibold text-white">{a.title}</h3>
                <p className="text-sm leading-relaxed text-graphite-300">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src="/images/craftsmanship.svg"
            alt="Сборка котла"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <span className="text-xs uppercase tracking-[0.24em] text-brand-red-700">
            Как мы работаем
          </span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-graphite-950 sm:text-4xl">
            От консультации до пуска в эксплуатацию
          </h2>
          <div className="mt-10 flex flex-col gap-8">
            {STEPS.map((step) => (
              <div key={step.n} className="flex gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-brand-red-700 font-display text-lg text-brand-red-800">
                  {step.n}
                </span>
                <div>
                  <h4 className="font-display text-lg font-semibold text-graphite-950">
                    {step.title}
                  </h4>
                  <p className="mt-1 text-sm text-graphite-500">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-red-800 py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 text-center sm:px-8">
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            Нужна консультация по выбору котла?
          </h2>
          <p className="max-w-xl text-white/85">
            Оставьте заявку — инженер перезвонит и поможет подобрать оптимальное
            решение для вашего дома в течение 15 минут.
          </p>
          <a
            href="tel:+78001234567"
            className="inline-flex items-center gap-2 bg-graphite-950 px-8 py-4 text-sm font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-graphite-900"
          >
            8 (800) 123-45-67
          </a>
        </div>
      </section>

      <BoilerWizard />
    </main>
  );
}
