"use client";

import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart-store";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CouponForm } from "@/components/cart/coupon-form";
import { PromotionForm } from "@/components/cart/promotion-form";
import { formatMoney } from "@/lib/format";

export function CartView({ currency }: { currency: string }) {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { cart, hasLoaded, isLoading, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasLoaded && isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingCart className="size-12 text-muted-foreground" />
        <p className="text-muted-foreground">{t("emptyTitle")}</p>
        <Button render={<Link href="/products">{t("emptyCta")}</Link>} />
      </div>
    );
  }

  const discounts = cart.discounts ?? [];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="rounded-xl border border-border px-4 lg:col-span-2">
        {cart.items.map((item) => (
          <CartLineItem key={`${item.productId}-${item.variantId ?? ""}`} item={item} currency={currency} />
        ))}
      </div>
      <div className="flex h-fit flex-col gap-4 rounded-xl border border-border p-5">
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{tc("subtotal")}</span>
            <span className="font-semibold">{formatMoney(cart.subtotal, currency, locale)}</span>
          </div>
          {discounts.map((discount, i) => (
            <div key={i} className="flex items-center justify-between text-primary">
              <span>{discount.label || tc("discount")}</span>
              <span>-{formatMoney(discount.amount, currency, locale)}</span>
            </div>
          ))}
          {discounts.length > 0 && (
            <div className="flex items-center justify-between border-t border-border pt-1.5 text-base font-bold text-foreground">
              <span>{t("estimatedTotal")}</span>
              <span>{formatMoney(cart.estimatedTotal, currency, locale)}</span>
            </div>
          )}
        </div>

        <CouponForm />
        <PromotionForm />

        <p className="text-xs text-muted-foreground">{t("shippingTaxNote")}</p>

        <Button size="lg" render={<Link href="/checkout">{t("proceedToCheckout")}</Link>} />
      </div>
    </div>
  );
}
