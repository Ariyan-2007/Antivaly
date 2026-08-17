"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { resolveApiImageUrl } from "@/lib/image";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const validImages = images
    .map(resolveApiImageUrl)
    .filter((url): url is string => !!url);

  if (validImages.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
        {alt}
      </div>
    );
  }

  const activeIndex = Math.min(active, validImages.length - 1);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <Image
          src={validImages[activeIndex]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-cover"
        />
      </div>
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {validImages.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border-2",
                i === activeIndex ? "border-primary" : "border-transparent"
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
