"use client";

import { useState } from "react";
import Image from "next/image";

type ProductGalleryProps = {
  images: string[];
  alt: string;
  discount: number | null;
};

export function ProductGallery({ images, alt, discount }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const activeImage = images[active] ?? images[0];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden bg-graphite-900">
        <Image
          src={activeImage}
          alt={alt}
          fill
          priority
          loading="eager"
          className="object-cover"
        />
        {discount && (
          <span className="absolute left-4 top-4 bg-brand-red-800 px-3 py-1 text-xs uppercase tracking-[0.12em] text-white">
            Скидка {discount}%
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((image, i) => (
            <button
              key={image + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1}`}
              className={`relative aspect-[4/3] overflow-hidden bg-graphite-900 transition-all ${
                i === active
                  ? "ring-2 ring-brand-red-700 ring-offset-2 ring-offset-[#f6f5f3]"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 1536px) 25vw, 200px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}