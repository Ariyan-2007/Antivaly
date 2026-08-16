"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Price } from "@/components/shop/price";
import { StockBadge } from "@/components/shop/stock-badge";
import { VariantPicker } from "@/components/shop/variant-picker";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { formatMoney } from "@/lib/format";
import type { ProductResponse } from "@/types/api";

export function ProductPurchasePanel({
  product,
  currency,
  locale,
}: {
  product: ProductResponse;
  currency: string;
  locale: string;
}) {
  const t = useTranslations("product");
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;

  const isOutOfStock = hasVariants
    ? selectedVariant
      ? selectedVariant.stockQuantity <= 0
      : false
    : !product.isAvailable;

  return (
    <div className="flex flex-col gap-4">
      {selectedVariant?.priceOverride != null ? (
        <span className="text-2xl font-bold text-foreground">
          {formatMoney(selectedVariant.priceOverride, currency, locale)}
        </span>
      ) : (
        <Price
          effectivePrice={product.effectivePrice}
          compareAtPrice={product.compareAtPrice}
          discountPercent={product.discountPercent}
          currency={currency}
          locale={locale}
          size="lg"
        />
      )}

      {hasVariants ? (
        selectedVariant && selectedVariant.stockQuantity <= 0 ? (
          <span className="text-xs font-medium text-destructive">{t("optionOutOfStock")}</span>
        ) : null
      ) : (
        <StockBadge stockQuantity={product.stockQuantity} trackInventory={product.trackInventory} />
      )}

      {hasVariants && (
        <VariantPicker
          variants={variants}
          selectedId={selectedVariantId}
          onSelect={setSelectedVariantId}
          currency={currency}
          locale={locale}
        />
      )}

      <div className="flex items-center gap-2 border-t border-border pt-4">
        <div className="flex-1">
          <AddToCartButton
            productId={product.id}
            variantId={selectedVariantId}
            disabled={isOutOfStock}
            variantRequired={hasVariants && !selectedVariantId}
          />
        </div>
        <WishlistButton productId={product.id} outOfStock={isOutOfStock} />
      </div>
    </div>
  );
}
