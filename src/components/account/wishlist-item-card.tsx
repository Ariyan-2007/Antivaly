"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { productHref } from "@/lib/routes";
import { formatMoney } from "@/lib/format";
import { isValidImageUrl } from "@/lib/image";
import type { WishlistItemResponse } from "@/types/api";

export function WishlistItemCard({ item, currency }: { item: WishlistItemResponse; currency: string }) {
  const t = useTranslations("wishlist");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [removed, setRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      try {
        await browserFetch(`/api/shop/account/wishlist/${item.productId}`, { method: "DELETE" });
        setRemoved(true);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  if (removed) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
      <Link href={productHref(item.productId, item.slug)} className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {isValidImageUrl(item.imageUrl) && (
          <Image src={item.imageUrl} alt={item.productName || ""} fill sizes="64px" className="object-cover" />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={productHref(item.productId, item.slug)} className="line-clamp-1 text-sm font-medium text-foreground hover:text-primary">
          {item.productName}
        </Link>
        <p className="text-sm font-semibold text-foreground">
          {formatMoney(item.effectivePrice, currency, locale)}
        </p>
        {!item.inStock && <p className="text-xs text-muted-foreground">{t("backInStockAlertActive")}</p>}
      </div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        aria-label={t("remove")}
        className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-40"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
