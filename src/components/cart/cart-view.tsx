"use client";

import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart-store";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { DiscountsCard } from "@/components/cart/discounts-card";
import { FulfillmentToggle } from "@/components/cart/fulfillment-toggle";
import { formatMoney } from "@/lib/format";

export function CartView({ currency }: { currency: string }) {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { cart, hasLoaded, isLoading, fetchCart, mutatingCount } = useCartStore();

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
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-3 lg:col-span-2">
        {cart.items.map((item) => (
          <CartLineItem key={`${item.productId}-${item.variantId ?? ""}`} item={item} currency={currency} />
        ))}

        <DiscountsCard currency={currency} />
      </div>

      <div className="flex h-fit flex-col gap-4 rounded-2xl border border-border p-5 lg:sticky lg:top-22">
        <p className="text-sm font-extrabold text-foreground">{t("orderSummary")}</p>

        <FulfillmentToggle />

        <div className="flex flex-col gap-2 text-sm">
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
          {cart.fulfillmentMethod !== "Pickup" && cart.fulfillmentMethod !== "Digital" && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{tc("deliveryFee")}</span>
              <span>{cart.deliveryFee === 0 ? tc("free") : formatMoney(cart.deliveryFee, currency, locale)}</span>
            </div>
          )}
          {cart.giftCardTotal > 0 && (
            <div className="flex items-center justify-between text-primary">
              <span>{t("giftCardApplied")}</span>
              <span>-{formatMoney(cart.giftCardTotal, currency, locale)}</span>
            </div>
          )}
          {cart.storeCreditApplied > 0 && (
            <div className="flex items-center justify-between text-primary">
              <span>{t("storeCreditApplied")}</span>
              <span>-{formatMoney(cart.storeCreditApplied, currency, locale)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border pt-2 text-base font-extrabold text-foreground">
            <span>{cart.amountDue !== cart.subtotal ? t("amountDue") : t("estimatedTotal")}</span>
            <span>{formatMoney(cart.amountDue, currency, locale)}</span>
          </div>
        </div>

        <Button
          size="lg"
          type="button"
          className="rounded-full"
          disabled={mutatingCount > 0}
          onClick={() => router.push("/checkout")}
        >
          {mutatingCount > 0 && <Loader2 className="size-4 animate-spin" />}
          {t("proceedToCheckout")}
        </Button>

        <p className="text-center text-xs text-muted-foreground">{t("shippingTaxNote")}</p>
      </div>
    </div>
  );
}
