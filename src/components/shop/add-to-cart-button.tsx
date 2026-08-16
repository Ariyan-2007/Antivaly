"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { ApiError } from "@/lib/api/client";

export function AddToCartButton({
  productId,
  variantId,
  disabled,
  /** true when the product has variants but none is selected yet — guards the click, not just the label. */
  variantRequired,
  variant = "full",
}: {
  productId: string;
  variantId?: string | null;
  disabled?: boolean;
  variantRequired?: boolean;
  variant?: "full" | "compact";
}) {
  const t = useTranslations("common");
  const tp = useTranslations("product");
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
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

  if (variant === "compact") {
    return (
      <Button
        size="sm"
        variant="secondary"
        className="w-full gap-1.5"
        disabled={disabled || isPending}
        onClick={handleAdd}
      >
        <ShoppingCart className="size-3.5" />
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
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={disabled}
          aria-label="Decrease quantity"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
        <button
          type="button"
          className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          onClick={() => setQuantity((q) => q + 1)}
          disabled={disabled}
          aria-label="Increase quantity"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <Button size="lg" className="flex-1 gap-2" disabled={disabled || isPending} onClick={handleAdd}>
        <ShoppingCart className="size-4" />
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
