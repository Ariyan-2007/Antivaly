"use client";

import { Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { AvailableOffers } from "@/components/cart/available-offers";
import { DiscountCodeForm } from "@/components/cart/discount-code-form";
import { StoreCreditToggle } from "@/components/cart/store-credit-toggle";

/** Every code-based/balance-based discount surface (blueprint §6.6) in one place, instead of a
 * stack of separate mini-forms — one card, one input, one applied-codes tray. Used on both the
 * cart and checkout pages so the experience is identical wherever it appears. */
export function DiscountsCard({ currency }: { currency: string }) {
  const t = useTranslations("cart");

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border p-3.5">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Tag className="size-4 text-primary" />
        {t("discountsTitle")}
      </p>
      <AvailableOffers currency={currency} />
      <DiscountCodeForm currency={currency} />
      <StoreCreditToggle currency={currency} />
    </div>
  );
}
