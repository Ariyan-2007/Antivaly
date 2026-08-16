"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart-store";
import { ApiError } from "@/lib/api/client";

/** Stackable promotion codes — distinct from the single `couponCode` (blueprint §6.3). */
export function PromotionForm() {
  const t = useTranslations("common");
  const tCart = useTranslations("cart");
  const applyPromotion = useCartStore((s) => s.applyPromotion);
  const removePromotion = useCartStore((s) => s.removePromotion);
  const cart = useCartStore((s) => s.cart);
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    startTransition(async () => {
      try {
        await applyPromotion(trimmed);
        toast.success(t("couponApplied", { code: trimmed }));
        setCode("");
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : t("errorGeneric"));
      }
    });
  }

  function handleRemove(promoCode: string) {
    startTransition(async () => {
      try {
        await removePromotion(promoCode);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : t("errorGeneric"));
      }
    });
  }

  const promotionCodes = cart?.promotionCodes ?? [];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {promotionCodes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {promotionCodes.map((promoCode) => (
            <span
              key={promoCode}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {promoCode}
              <button type="button" onClick={() => handleRemove(promoCode)} aria-label={t("remove")}>
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={tCart("promotionPlaceholder")}
        />
        <Button type="submit" variant="outline" disabled={isPending}>
          {t("applyCoupon")}
        </Button>
      </div>
    </form>
  );
}
