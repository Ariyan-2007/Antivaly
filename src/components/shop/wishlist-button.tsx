"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  outOfStock,
  className,
}: {
  productId: string;
  outOfStock?: boolean;
  className?: string;
}) {
  const t = useTranslations("wishlist");
  const user = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    startTransition(async () => {
      try {
        if (saved) {
          await browserFetch(`/api/shop/account/wishlist/${productId}`, { method: "DELETE" });
          setSaved(false);
        } else {
          await browserFetch(`/api/shop/account/wishlist/${productId}`, { method: "POST" });
          setSaved(true);
          if (outOfStock) toast.success(t("backInStockAlertSet"));
        }
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : t("errorGeneric"));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={saved ? t("remove") : t("add")}
      aria-pressed={saved}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 disabled:opacity-60",
        className
      )}
    >
      <Heart className={cn("size-4", saved && "fill-destructive text-destructive")} />
      {saved ? t("saved") : t("add")}
    </button>
  );
}
