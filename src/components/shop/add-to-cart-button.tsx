"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { ApiError } from "@/lib/api/client";

/** The actual "add this to the cart" call, shared by every surface that can trigger it (the
 * inline PDP button, its mobile sticky-bar twin) so a shared `quantity` can never desync between
 * two separate `isPending`/toast copies of the same request. */
export function useAddToCart({
  productId,
  variantId,
  variantRequired,
  quantity,
}: {
  productId: string;
  variantId?: string | null;
  variantRequired?: boolean;
  quantity: number;
}) {
  const t = useTranslations("common");
  const tp = useTranslations("product");
  const addItem = useCartStore((s) => s.addItem);
  const [isPending, startTransition] = useTransition();

  function add() {
    if (variantRequired) {
      toast.error(tp("selectOptionFirst"));
      return;
    }
    startTransition(async () => {
      try {
        await addItem(productId, quantity, variantId);
        toast.success(tp("addedToCart"));
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : t("errorGeneric"));
      }
    });
  }

  return { isPending, add };
}

export function AddToCartButton({
  productId,
  variantId,
  disabled,
  /** true when the product has variants but none is selected yet — guards the click, not just the label. */
  variantRequired,
  variant = "full",
  quantity: controlledQuantity,
  onQuantityChange,
  /** "full" only — the PDP hides this button on mobile in favor of a sticky bottom buy bar that
   * shares this same quantity, so the stepper stays inline but the submit action doesn't appear twice. */
  hideSubmitOnMobile,
}: {
  productId: string;
  variantId?: string | null;
  disabled?: boolean;
  variantRequired?: boolean;
  variant?: "full" | "compact";
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  hideSubmitOnMobile?: boolean;
}) {
  const t = useTranslations("common");
  const tp = useTranslations("product");
  const [localQuantity, setLocalQuantity] = useState(1);
  const quantity = controlledQuantity ?? localQuantity;
  const setQuantity = onQuantityChange ?? setLocalQuantity;
  const { isPending, add } = useAddToCart({ productId, variantId, variantRequired, quantity });

  if (variant === "compact") {
    return (
      <Button
        size="sm"
        variant="secondary"
        className="w-full gap-1.5"
        disabled={disabled || isPending}
        onClick={add}
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <ShoppingCart className="size-3.5" />
        )}
        {isPending ? t("adding") : t("addToCart")}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-lg border border-border">
        <button
          type="button"
          className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={disabled}
          aria-label="Decrease quantity"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
        <button
          type="button"
          className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          onClick={() => setQuantity(quantity + 1)}
          disabled={disabled}
          aria-label="Increase quantity"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <Button
        size="lg"
        className={hideSubmitOnMobile ? "hidden flex-1 gap-2 md:flex" : "flex-1 gap-2"}
        disabled={disabled || isPending}
        onClick={add}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ShoppingCart className="size-4" />
        )}
        {disabled && !variantRequired
          ? t("outOfStock")
          : variantRequired
            ? tp("selectOption")
            : isPending
              ? t("adding")
              : t("addToCart")}
      </Button>
    </div>
  );
}
