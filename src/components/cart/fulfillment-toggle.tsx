"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Truck, Store, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useBusiness } from "@/components/providers/business-provider";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { FulfillmentMethod } from "@/types/api";

const OPTIONS: FulfillmentMethod[] = ["Delivery", "Pickup"];

/**
 * Delivery-vs-Pickup is now a cart-level, preview-only setting (blueprint §6.3/§9.44) — setting
 * it here is what makes `cart.deliveryFee`/`cart.shippingOptions` honest immediately, before an
 * address is ever entered. Shared between the cart and checkout pages so the choice made on one
 * carries straight into the other instead of resetting.
 */
export function FulfillmentToggle() {
  const t = useTranslations("checkout");
  const tc = useTranslations("common");
  const business = useBusiness();
  const cart = useCartStore((s) => s.cart);
  const setFulfillmentMethod = useCartStore((s) => s.setFulfillmentMethod);
  const [isPending, startTransition] = useTransition();

  if (!business.deliveryModuleEnabled || !cart) return null;

  function handleSelect(method: FulfillmentMethod) {
    if (!cart || method === cart.fulfillmentMethod) return;
    startTransition(async () => {
      try {
        await setFulfillmentMethod(method);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
        {t("fulfillmentMethod")}
      </h2>
      <div className="flex rounded-full border border-border p-0.75">
        {OPTIONS.map((method) => {
          const isActive = cart.fulfillmentMethod === method;
          return (
            <button
              key={method}
              type="button"
              onClick={() => handleSelect(method)}
              disabled={isPending}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-colors disabled:opacity-60",
                isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
              )}
            >
              {isPending && !isActive ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : method === "Delivery" ? (
                <Truck className="size-3.5" />
              ) : (
                <Store className="size-3.5" />
              )}
              {method === "Delivery" ? t("deliveryOption") : t("pickupOption")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
