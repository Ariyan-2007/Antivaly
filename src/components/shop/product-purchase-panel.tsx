"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, ShoppingCart } from "lucide-react";
import { Price } from "@/components/shop/price";
import { StockBadge } from "@/components/shop/stock-badge";
import { VariantPicker } from "@/components/shop/variant-picker";
import { AddToCartButton, useAddToCart } from "@/components/shop/add-to-cart-button";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { Button } from "@/components/ui/button";
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
  const tc = useTranslations("common");
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;
  // Lifted so the mobile sticky buy bar's "Add to Cart" always submits the exact quantity shown
  // on the stepper above it — the two never see independent state to drift out of sync.
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = hasVariants
    ? selectedVariant
      ? selectedVariant.stockQuantity <= 0
      : false
    : !product.isAvailable;
  const variantRequired = hasVariants && !selectedVariantId;
  const unitPrice = selectedVariant?.priceOverride ?? product.effectivePrice;
  const { isPending: isAddingSticky, add: addFromStickyBar } = useAddToCart({
    productId: product.id,
    variantId: selectedVariantId,
    variantRequired,
    quantity,
  });

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
            variantRequired={variantRequired}
            quantity={quantity}
            onQuantityChange={setQuantity}
            hideSubmitOnMobile
          />
        </div>
        <WishlistButton productId={product.id} outOfStock={isOutOfStock} />
      </div>

      {/* Mobile only — the submit button above is hidden below `md` in favor of this bar, fixed
          above the global bottom nav so it's always reachable without hunting back up the page. */}
      <div className="fixed inset-x-0 bottom-16 z-30 flex h-17 items-center gap-3 border-t border-border bg-background px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden">
        <span className="text-lg font-bold text-foreground">
          {formatMoney(unitPrice, currency, locale)}
        </span>
        <Button
          size="lg"
          className="flex-1 gap-2"
          disabled={isOutOfStock || isAddingSticky}
          onClick={addFromStickyBar}
        >
          {isAddingSticky ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShoppingCart className="size-4" />
          )}
          {isOutOfStock && !variantRequired
            ? tc("outOfStock")
            : variantRequired
              ? t("selectOption")
              : isAddingSticky
                ? tc("adding")
                : tc("addToCart")}
        </Button>
      </div>
      <div className="h-17 md:hidden" aria-hidden />
    </div>
  );
}
