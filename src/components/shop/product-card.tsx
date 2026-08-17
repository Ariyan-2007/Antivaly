import Image from "next/image";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Price } from "@/components/shop/price";
import { StockBadge } from "@/components/shop/stock-badge";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { productHref } from "@/lib/routes";
import { firstValidImage } from "@/lib/image";
import type { ProductResponse } from "@/types/api";

export function ProductCard({
  product,
  currency,
  locale,
}: {
  product: ProductResponse;
  currency: string;
  locale: string;
}) {
  const t = useTranslations("common");
  const productName = product.name || "";
  const image = firstValidImage(product.images);
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const isOutOfStock = !hasVariants && !product.isAvailable;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-foreground/10">
      <Link
        href={productHref(product.id, product.slug)}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        {image ? (
          <Image
            src={image}
            alt={productName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
            {productName}
          </div>
        )}
        {!!product.discountPercent && product.discountPercent > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-deal px-2 py-1 text-xs font-bold text-deal-foreground shadow-sm shadow-deal/40">
            -{product.discountPercent}%
          </span>
        )}
        <WishlistButton
          productId={product.id}
          outOfStock={isOutOfStock}
          variant="icon"
          className="absolute right-2 top-2"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
              {t("outOfStock")}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link
          href={productHref(product.id, product.slug)}
          className="line-clamp-2 min-h-10 text-sm font-medium text-foreground hover:text-primary"
        >
          {productName}
        </Link>

        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{product.averageRating.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
          </div>
        )}

        <Price
          effectivePrice={product.effectivePrice}
          compareAtPrice={product.compareAtPrice}
          currency={currency}
          locale={locale}
          size="sm"
        />

        <StockBadge stockQuantity={product.stockQuantity} trackInventory={product.trackInventory} />

        <div className="mt-1">
          {hasVariants ? (
            <Link
              href={productHref(product.id, product.slug)}
              className="flex h-8 w-full items-center justify-center rounded-lg bg-secondary text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              {t("viewOptions")}
            </Link>
          ) : (
            <AddToCartButton productId={product.id} disabled={isOutOfStock} variant="compact" />
          )}
        </div>
      </div>
    </div>
  );
}
