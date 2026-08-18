"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore } from "@/store/cart-store";
import { useAuth } from "@/components/providers/auth-provider";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import type { StoreCreditBalanceResponse } from "@/types/api";

/** Customer only (blueprint §6.6/§9.43) — a guest has no account and therefore no balance to
 * opt into, so this renders nothing for a guest cart. */
export function StoreCreditToggle({ currency }: { currency: string }) {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const locale = useLocale();
  const user = useAuth();
  const cart = useCartStore((s) => s.cart);
  const setUseStoreCredit = useCartStore((s) => s.setUseStoreCredit);
  const [balance, setBalance] = useState<StoreCreditBalanceResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBalance(null);
      return;
    }
    let cancelled = false;
    browserFetch<StoreCreditBalanceResponse>("/api/shop/account/store-credit")
      .then((data) => {
        if (!cancelled) setBalance(data);
      })
      .catch(() => {
        if (!cancelled) setBalance(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || !balance || balance.balance <= 0) return null;

  function handleChange(checked: boolean) {
    startTransition(async () => {
      try {
        await setUseStoreCredit(checked);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  return (
    <label className="group flex items-center gap-2 text-sm">
      <Checkbox
        checked={cart?.useStoreCredit ?? false}
        onCheckedChange={(v) => handleChange(!!v)}
        disabled={isPending}
      />
      <span>
        {t("useStoreCredit", { amount: formatMoney(balance.balance, balance.currency || currency, locale) })}
      </span>
      {isPending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
    </label>
  );
}
