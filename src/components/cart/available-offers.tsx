"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Loader2, Sparkles, Plus } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { ApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AvailableOfferResponse } from "@/types/api";

/**
 * Surfaces `Public`-visibility coupon/promotion codes so the shopper doesn't have to already
 * know a code to benefit from it (blueprint §6.6). A `Hidden` code — one received by email —
 * never appears here; it still applies through the exact same discount-code form.
 */
export function AvailableOffers({ currency }: { currency: string }) {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const locale = useLocale();
  const cart = useCartStore((s) => s.cart);
  const offers = useCartStore((s) => s.availableOffers);
  const fetchAvailableOffers = useCartStore((s) => s.fetchAvailableOffers);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const applyPromotion = useCartStore((s) => s.applyPromotion);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchAvailableOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.itemCount, cart?.subtotal]);

  const appliedCoupon = cart?.couponCode;
  const appliedPromotions = new Set(cart?.promotionCodes ?? []);
  const applicable = offers.filter((offer) =>
    offer.source === "Coupon" ? offer.code !== appliedCoupon : !appliedPromotions.has(offer.code)
  );

  if (applicable.length === 0) return null;

  function handleApply(offer: AvailableOfferResponse) {
    setPendingCode(offer.code);
    startTransition(async () => {
      try {
        if (offer.source === "Coupon") await applyCoupon(offer.code);
        else await applyPromotion(offer.code);
        toast.success(t("codeApplied", { code: offer.code }));
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      } finally {
        setPendingCode(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3.5" />
        {t("availableOffers")}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {applicable.map((offer) => {
          const isThisPending = isPending && pendingCode === offer.code;
          return (
            <button
              key={`${offer.source}-${offer.code}`}
              type="button"
              disabled={isPending}
              onClick={() => handleApply(offer)}
              className={cn(
                "group flex items-center gap-1.5 rounded-full border border-dashed border-primary/40 bg-primary/5 py-1 pl-2.5 pr-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
              )}
              title={
                offer.minOrderAmount
                  ? t("minOrder", { amount: formatMoney(offer.minOrderAmount, currency, locale) })
                  : undefined
              }
            >
              <span>{offer.summary || offer.label || offer.code}</span>
              <span className="flex size-4 items-center justify-center rounded-full bg-primary/15 group-hover:bg-primary/25">
                {isThisPending ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
