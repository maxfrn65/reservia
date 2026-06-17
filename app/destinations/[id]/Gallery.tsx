"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type GalleryImage = { url: string; alt: string | null };

export default function Gallery({
  images,
  destinationName,
}: {
  images: GalleryImage[];
  destinationName: string;
}) {
  const [active, setActive] = useState(0);
  if (images.length === 0) return null;
  const main = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
        <Image
          src={main.url}
          alt={main.alt ?? destinationName}
          fill
          priority
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Afficher l'image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg bg-muted transition",
                i === active ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${destinationName} ${i + 1}`}
                fill
                sizes="160px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
