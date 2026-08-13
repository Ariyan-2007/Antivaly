"use client";

import { useTransition } from "react";
import { Minus, Plus, X } from "lucide-react";
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
        if (next <= 0) await removeItem(item.productId);
        else await updateItem(item.productId, next);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : t("errorGeneric"));
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-4 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {item.productName || t("unnamedItem")}
        </p>
        <p className="text-xs text-muted-foreground">{formatMoney(item.unitPrice, currency, locale)}</p>
      </div>
      <div className="flex items-center rounded-lg border border-border">
        <button
          type="button"
          className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          onClick={() => change(item.quantity - 1)}
          disabled={isPending}
          aria-label="Decrease quantity"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
        <button
          type="button"
          className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          onClick={() => change(item.quantity + 1)}
          disabled={isPending}
          aria-label="Increase quantity"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      <p className="w-20 shrink-0 text-right text-sm font-semibold">
        {formatMoney(item.lineTotal, currency, locale)}
      </p>
      <button
        type="button"
        className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-40"
        onClick={() => change(0)}
        disabled={isPending}
        aria-label={t("remove")}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
