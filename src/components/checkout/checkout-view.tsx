"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart-store";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export function CheckoutView({
  currency,
  deliveryModuleEnabled,
}: {
  currency: string;
  deliveryModuleEnabled: boolean;
}) {
  const t = useTranslations("cart");
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
        <p className="text-muted-foreground">{t("emptyTitle")}</p>
        <Button render={<Link href="/products">{t("emptyCta")}</Link>} />
      </div>
    );
  }

  return (
    <CheckoutForm cart={cart} currency={currency} deliveryModuleEnabled={deliveryModuleEnabled} />
  );
}
