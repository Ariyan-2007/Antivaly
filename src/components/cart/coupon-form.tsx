"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart-store";
import { ApiError } from "@/lib/api/client";

export function CouponForm() {
  const t = useTranslations("common");
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const cart = useCartStore((s) => s.cart);
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    startTransition(async () => {
      try {
        await applyCoupon(trimmed);
        toast.success(t("couponApplied", { code: trimmed }));
        setCode("");
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : t("errorGeneric"));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {cart?.couponCode && (
        <p className="text-sm font-medium text-primary">
          {t("couponApplied", { code: cart.couponCode })}
        </p>
      )}
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("couponPlaceholder")}
        />
        <Button type="submit" variant="outline" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {t("applyCoupon")}
        </Button>
      </div>
    </form>
  );
}
