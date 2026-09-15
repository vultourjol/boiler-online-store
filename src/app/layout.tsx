import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompareBar } from "@/components/CompareBar";
import { CartProvider } from "@/lib/cart-context";
import { CompareProvider } from "@/lib/compare-context";
import { getBrandsByCountry } from "@/db/queries";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Калория — премиальные отопительные котлы для загородных домов",
  description:
    "Интернет-магазин отопительных котлов премиум-класса: газовые, твердотопливные, электрические, дизельные, пеллетные и комбинированные модели с доставкой и монтажом.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const brandGroups = await getBrandsByCountry();

  return (
    <html lang="ru" data-scroll-behavior="smooth" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="flex min-h-screen flex-col bg-[#f6f5f3] text-graphite-950 antialiased">
        <CompareProvider>
          <CartProvider>
            <Header brandGroups={brandGroups} />
            <div className="flex-1">{children}</div>
            <Footer />
            <CompareBar />
          </CartProvider>
        </CompareProvider>
      </body>
    </html>
  );
}
