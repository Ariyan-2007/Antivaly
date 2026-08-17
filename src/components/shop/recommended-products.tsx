import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { productHref } from "@/lib/routes";
import { formatMoney } from "@/lib/format";
import { resolveApiImageUrl } from "@/lib/image";
import type { RecommendedProductResponse } from "@/types/api";

export function RecommendedProducts({
  title,
  products,
  currency,
  locale,
}: {
  title: string;
  products: RecommendedProductResponse[];
  currency: string;
  locale: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-8">
      <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
        {products.map((p) => {
          const imageSrc = resolveApiImageUrl(p.imageUrl);
          return (
            <Link
              key={p.productId}
              href={productHref(p.productId, p.slug)}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={p.productName || ""}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    {p.productName}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 p-2.5">
                <span className="line-clamp-2 min-h-8 text-xs font-medium text-foreground">
                  {p.productName}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatMoney(p.effectivePrice, currency, locale)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
