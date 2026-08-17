"use client";

import { useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { ReturnStatusBadge } from "@/components/orders/return-status-badge";
import { formatDate, formatMoney } from "@/lib/format";
import type { ReturnResponse, ReturnStatus } from "@/types/api";

const CANCELLABLE = new Set<ReturnStatus>(["Requested", "Approved"]);

export function ReturnCard({ ret }: { ret: ReturnResponse }) {
  const t = useTranslations("returns");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currency = ret.currency || "USD";

  function handleCancel() {
    startTransition(async () => {
      try {
        await browserFetch(`/api/shop/orders/returns/${ret.id}/cancel`, { method: "POST" });
        toast.success(t("cancelled"));
        router.refresh();
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">
            {t("rmaNumber", { number: ret.rmaNumber ?? ret.id.slice(0, 8) })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("forOrder", { number: ret.orderNumber ?? ret.orderId.slice(0, 8) })}
          </p>
        </div>
        <ReturnStatusBadge status={ret.status} />
      </div>

      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        {ret.items.map((item, i) => (
          <span key={i}>
            {item.productName || tc("unnamedItem")} × {item.quantity}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{formatDate(ret.createdAt, locale)}</span>
        <span className="font-semibold text-foreground">
          {formatMoney(ret.approvedRefundAmount ?? ret.requestedRefundAmount, currency, locale)}
        </span>
      </div>

      {CANCELLABLE.has(ret.status) && (
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending} className="w-fit">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {t("cancelRequest")}
        </Button>
      )}
    </div>
  );
}
