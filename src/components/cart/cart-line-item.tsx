"use client";

import { useTransition } from "react";
import { Loader2, Minus, Plus, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { formatMoney } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import type { CartItem } from "@/types/api";

export function CartLineItem({ item, currency }: { item: CartItem; currency: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const [isPending, startTransition] = useTransition();

  function change(next: number) {
    startTransition(async () => {
      try {
        if (next <= 0) await removeItem(item.productId, item.variantId);
        else await updateItem(item.productId, next, item.variantId);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : t("errorGeneric"));
      }
    });
  }

  return (
    <div className="flex gap-3 rounded-2xl border border-border p-3.5">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-sm font-bold text-foreground">
          {item.productName || t("unnamedItem")}
        </p>
        {item.variantSummary && (
          <p className="text-xs text-muted-foreground">{item.variantSummary}</p>
        )}
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center rounded-full border border-border">
            <button
              type="button"
              className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
              onClick={() => change(item.quantity - 1)}
              disabled={isPending}
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-7 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
            <button
              type="button"
              className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
              onClick={() => change(item.quantity + 1)}
              disabled={isPending}
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <p className="text-sm font-extrabold text-foreground">
            {formatMoney(item.lineTotal, currency, locale)}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="shrink-0 self-start text-muted-foreground hover:text-destructive disabled:opacity-40"
        onClick={() => change(0)}
        disabled={isPending}
        aria-label={t("remove")}
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4.5" />}
      </button>
    </div>
  );
}
