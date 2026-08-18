"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Loader2, Ticket, Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart-store";
import { ApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";

/**
 * One box for every code-based discount surface (blueprint §6.6) — a shopper shouldn't have to
 * know whether their code is a "coupon", a "promotion", or a "gift card" before they can use it.
 * Tries each endpoint in turn and stops at the first one that recognizes the code; a 404 from a
 * surface just means "wrong surface, try the next one", while any other error (expired, below
 * minimum order, already applied) is the real answer and is shown immediately.
 */
export function DiscountCodeForm({ currency }: { currency: string }) {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const locale = useLocale();
  const cart = useCartStore((s) => s.cart);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const applyPromotion = useCartStore((s) => s.applyPromotion);
  const removePromotion = useCartStore((s) => s.removePromotion);
  const applyGiftCard = useCartStore((s) => s.applyGiftCard);
  const removeGiftCard = useCartStore((s) => s.removeGiftCard);
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [removing, setRemoving] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    startTransition(async () => {
      // Coupon and gift-card cleanly distinguish "no such code" (404) from "real code, rejected
      // for a reason" (409 with a specific message: below minimum order, no balance, expired) —
      // safe to cascade past a 404 and stop-and-show anything else. Promotion can't make that
      // distinction: CartService.ApplyPromotionCodeAsync throws the same generic 409 whether the
      // code doesn't exist at all or exists but doesn't currently qualify for this cart/customer.
      // Tried last for exactly that reason — stopping on its ambiguous 409 earlier in the chain
      // used to swallow real gift-card codes before they ever reached the gift-card endpoint.
      const attempts: [typeof applyCoupon, boolean][] = [
        [applyCoupon, false],
        [applyGiftCard, false],
        [applyPromotion, true],
      ];
      for (const [attempt, isAmbiguous] of attempts) {
        try {
          await attempt(trimmed);
          toast.success(t("codeApplied", { code: trimmed }));
          setCode("");
          return;
        } catch (err) {
          if (isAmbiguous) break; // last attempt either way — fall through to the generic message
          if (err instanceof ApiError && err.status === 404) continue;
          toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
          return;
        }
      }
      toast.error(t("codeNotFound"));
    });
  }

  function handleRemoveCoupon(couponCode: string) {
    setRemoving(couponCode);
    startTransition(async () => {
      try {
        await removeCoupon();
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      } finally {
        setRemoving(null);
      }
    });
  }

  function handleRemovePromotion(promoCode: string) {
    setRemoving(promoCode);
    startTransition(async () => {
      try {
        await removePromotion(promoCode);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      } finally {
        setRemoving(null);
      }
    });
  }

  function handleRemoveGiftCard(giftCardCode: string) {
    setRemoving(giftCardCode);
    startTransition(async () => {
      try {
        await removeGiftCard(giftCardCode);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      } finally {
        setRemoving(null);
      }
    });
  }

  const promotionCodes = cart?.promotionCodes ?? [];
  const giftCardCodes = cart?.giftCardCodes ?? [];
  const hasApplied = !!cart?.couponCode || promotionCodes.length > 0 || giftCardCodes.length > 0;

  return (
    <div className="flex flex-col gap-2.5">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("discountCodePlaceholder")}
          className="flex-1"
        />
        <Button type="submit" variant="outline" disabled={isPending || !code.trim()}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : tc("applyCoupon")}
        </Button>
      </form>

      {hasApplied && (
        <div className="flex flex-wrap gap-1.5">
          {cart?.couponCode && (
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Ticket className="size-3" />
              {cart.couponCode}
              <button
                type="button"
                onClick={() => handleRemoveCoupon(cart.couponCode!)}
                disabled={isPending && removing === cart.couponCode}
                aria-label={tc("remove")}
              >
                <X className="size-3" />
              </button>
            </span>
          )}
          {promotionCodes.map((promoCode) => (
            <span
              key={promoCode}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              <Ticket className="size-3" />
              {promoCode}
              <button
                type="button"
                onClick={() => handleRemovePromotion(promoCode)}
                disabled={isPending && removing === promoCode}
                aria-label={tc("remove")}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {giftCardCodes.map((giftCardCode) => (
            <span
              key={giftCardCode}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              <Gift className="size-3" />
              {giftCardCode}
              <button
                type="button"
                onClick={() => handleRemoveGiftCard(giftCardCode)}
                disabled={isPending && removing === giftCardCode}
                aria-label={tc("remove")}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {cart && cart.giftCardTotal > 0 && (
            <span className="self-center text-xs text-muted-foreground">
              {t("giftCardApplied")} -{formatMoney(cart.giftCardTotal, currency, locale)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
