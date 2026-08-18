"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import type { CreateReturnRequest, OrderItem, ProductVariantResponse, ReturnReason, ReturnResolution } from "@/types/api";

const REASONS: ReturnReason[] = [
  "Damaged",
  "WrongItem",
  "NotAsDescribed",
  "ChangedMind",
  "SizeOrFit",
  "Other",
];
const RESOLUTIONS: ReturnResolution[] = ["Refund", "Exchange", "StoreCredit"];

/** What an Exchange picker needs from a returnable line's product — its current effective price
 * (the fallback when a variant has no `priceOverride`) and its full variant list. */
export type ExchangeableProduct = { effectivePrice: number; variants: ProductVariantResponse[] };

export function ReturnForm({
  orderId,
  items,
  exchangeableProducts,
}: {
  orderId: string;
  items: OrderItem[];
  exchangeableProducts: Record<string, ExchangeableProduct>;
}) {
  const t = useTranslations("returns");
  const tc = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const returnable = items.filter((item) => item.quantity - item.refundedQuantity > 0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState<ReturnReason>("ChangedMind");
  const [resolution, setResolution] = useState<ReturnResolution>("Refund");
  const [reasonNote, setReasonNote] = useState("");
  const [desiredVariantIds, setDesiredVariantIds] = useState<Record<string, string>>({});

  function keyOf(item: OrderItem): string {
    return `${item.productId}-${item.variantId ?? ""}`;
  }

  // Exchange is a same-price swap only (§9.49, mirrors the backend's own check exactly so a
  // customer never picks an option the server will just 409 back) — only a variant priced the
  // same as what was actually paid, and not the one already delivered, is offerable.
  function eligibleVariants(item: OrderItem): ProductVariantResponse[] {
    const product = exchangeableProducts[item.productId];
    if (!product) return [];
    return product.variants.filter(
      (v) => v.id !== item.variantId && (v.priceOverride ?? product.effectivePrice) === item.unitPrice
    );
  }

  function onSubmit() {
    const selectedItems = returnable
      .map((item) => ({ item, quantity: quantities[keyOf(item)] ?? 0 }))
      .filter((i) => i.quantity > 0);

    if (selectedItems.length === 0) {
      toast.error(t("selectAtLeastOne"));
      return;
    }

    if (resolution === "Exchange") {
      const missing = selectedItems.some(({ item }) => !desiredVariantIds[keyOf(item)]);
      if (missing) {
        toast.error(t("selectDesiredVariant"));
        return;
      }
    }

    const body: CreateReturnRequest = {
      orderId,
      items: selectedItems.map(({ item, quantity }) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity,
        desiredVariantId: resolution === "Exchange" ? desiredVariantIds[keyOf(item)] : undefined,
      })),
      reason,
      reasonNote,
      resolution,
    };

    startTransition(async () => {
      try {
        await browserFetch("/api/shop/orders/returns", { method: "POST", body });
        toast.success(t("requestSubmitted"));
        router.push("/account/returns");
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  const selectedReturnable = returnable.filter((item) => (quantities[keyOf(item)] ?? 0) > 0);
  const exchangeBlocked =
    resolution === "Exchange" && selectedReturnable.some((item) => eligibleVariants(item).length === 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">{t("selectItems")}</h2>
        {returnable.map((item) => {
          const max = item.quantity - item.refundedQuantity;
          const key = keyOf(item);
          const wantsExchange = resolution === "Exchange" && (quantities[key] ?? 0) > 0;
          const variantOptions = wantsExchange ? eligibleVariants(item) : [];
          return (
            <div key={key} className="flex flex-col gap-2.5 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.productName || tc("unnamedItem")}
                  </p>
                  {item.variantSummary && (
                    <p className="text-xs text-muted-foreground">{item.variantSummary}</p>
                  )}
                </div>
                <Select
                  value={String(quantities[key] ?? 0)}
                  onValueChange={(v) => setQuantities((q) => ({ ...q, [key]: Number(v) }))}
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: max + 1 }).map((_, n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {wantsExchange && (
                <div className="flex flex-col gap-1.5 border-t border-border pt-2.5">
                  <Label className="text-xs">{t("desiredVariant")}</Label>
                  {variantOptions.length > 0 ? (
                    <Select
                      value={desiredVariantIds[key] ?? ""}
                      onValueChange={(v) => v && setDesiredVariantIds((d) => ({ ...d, [key]: v }))}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue placeholder={t("desiredVariantPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {variantOptions.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.attributeSummary || v.sku || v.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-xs text-destructive">{t("noEligibleVariant")}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("reason")}</Label>
        <Select value={reason} onValueChange={(v) => v && setReason(v as ReturnReason)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REASONS.map((r) => (
              <SelectItem key={r} value={r}>
                {t(`reasons.${r}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reasonNote">{t("reasonNote")}</Label>
        <Textarea id="reasonNote" rows={3} value={reasonNote} onChange={(e) => setReasonNote(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("resolution")}</Label>
        <Select value={resolution} onValueChange={(v) => v && setResolution(v as ReturnResolution)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESOLUTIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {t(`resolutions.${r}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onSubmit} disabled={isPending || exchangeBlocked} size="lg">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {t("submitRequest")}
      </Button>
    </div>
  );
}
