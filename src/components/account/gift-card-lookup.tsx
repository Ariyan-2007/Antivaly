"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import type { GiftCardBalanceResponse } from "@/types/api";

export function GiftCardLookup() {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<GiftCardBalanceResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    startTransition(async () => {
      try {
        const data = await browserFetch<GiftCardBalanceResponse>(
          `/api/shop/account/gift-cards/${encodeURIComponent(trimmed)}`
        );
        setResult(data);
      } catch (err) {
        setResult(null);
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("giftCardCodePlaceholder")}
        />
        <Button type="submit" variant="outline" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {t("checkBalance")}
        </Button>
      </div>
      {result && (
        <p className="text-sm text-muted-foreground">
          {t("giftCardBalance", {
            amount: formatMoney(result.remainingBalance, result.currency || "USD", locale),
          })}
        </p>
      )}
    </form>
  );
}
