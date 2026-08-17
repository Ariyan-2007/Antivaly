"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  outOfStock,
  variant = "default",
  className,
}: {
  productId: string;
  outOfStock?: boolean;
  /** "icon" renders a compact circular heart-only button for overlaying on a product card
   * image, instead of the full bordered label button used on the product detail page. */
  variant?: "default" | "icon";
  className?: string;
}) {
  const t = useTranslations("wishlist");
  const user = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick(event: React.MouseEvent) {
    // May sit inside a product card's own image/title link — never let the click fall through
    // to that link's navigation.
    event.preventDefault();
    event.stopPropagation();
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

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={saved ? t("remove") : t("add")}
        aria-pressed={saved}
        className={cn(
          "flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:text-destructive disabled:opacity-60",
          className
        )}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Heart className={cn("size-4", saved && "fill-destructive text-destructive")} />
        )}
      </button>
    );
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
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Heart className={cn("size-4", saved && "fill-destructive text-destructive")} />
      )}
      {saved ? t("saved") : t("add")}
    </button>
  );
}
