"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import type { ProductVariantResponse } from "@/types/api";

/**
 * Variants only carry a flat `attributeSummary` string (e.g. "Red / Large") — the API doesn't
 * break them into structured attributes — so this is a selectable list rather than
 * per-attribute dropdowns.
 */
export function VariantPicker({
  variants,
  selectedId,
  onSelect,
  currency,
  locale,
}: {
  variants: ProductVariantResponse[];
  selectedId: string | null;
  onSelect: (variantId: string) => void;
  currency: string;
  locale: string;
}) {
  const t = useTranslations("product");

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{t("availableOptions")}</span>
      <div className="flex flex-col gap-2">
        {variants.map((variant) => {
          const outOfStock = variant.stockQuantity <= 0;
          const selected = selectedId === variant.id;
          return (
            <button
              key={variant.id}
              type="button"
              disabled={outOfStock}
              onClick={() => onSelect(variant.id)}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="flex items-center gap-2">
                {selected && <Check className="size-4 shrink-0 text-primary" />}
                <span className="font-medium text-foreground">
                  {variant.attributeSummary || variant.sku || t("optionFallback")}
                </span>
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {variant.priceOverride !== null && (
                  <span className="font-semibold text-foreground">
                    {formatMoney(variant.priceOverride, currency, locale)}
                  </span>
                )}
                {outOfStock ? t("optionOutOfStock") : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
