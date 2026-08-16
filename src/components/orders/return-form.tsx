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
import type { CreateReturnRequest, OrderItem, ReturnReason, ReturnResolution } from "@/types/api";

const REASONS: ReturnReason[] = [
  "Damaged",
  "WrongItem",
  "NotAsDescribed",
  "ChangedMind",
  "SizeOrFit",
  "Other",
];
const RESOLUTIONS: ReturnResolution[] = ["Refund", "Exchange", "StoreCredit"];

export function ReturnForm({ orderId, items }: { orderId: string; items: OrderItem[] }) {
  const t = useTranslations("returns");
  const tc = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const returnable = items.filter((item) => item.quantity - item.refundedQuantity > 0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState<ReturnReason>("ChangedMind");
  const [resolution, setResolution] = useState<ReturnResolution>("Refund");
  const [reasonNote, setReasonNote] = useState("");

  function keyOf(item: OrderItem): string {
    return `${item.productId}-${item.variantId ?? ""}`;
  }

  function onSubmit() {
    const selectedItems = returnable
      .map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: quantities[keyOf(item)] ?? 0,
      }))
      .filter((i) => i.quantity > 0);

    if (selectedItems.length === 0) {
      toast.error(t("selectAtLeastOne"));
      return;
    }

    const body: CreateReturnRequest = { orderId, items: selectedItems, reason, reasonNote, resolution };

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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">{t("selectItems")}</h2>
        {returnable.map((item) => {
          const max = item.quantity - item.refundedQuantity;
          const key = keyOf(item);
          return (
            <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
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

      <Button onClick={onSubmit} disabled={isPending} size="lg">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {t("submitRequest")}
      </Button>
    </div>
  );
}
