"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const t = useTranslations("orders");
  const tc = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(async () => {
      try {
        await browserFetch(`/api/shop/orders/${orderId}/cancel`, { method: "POST" });
        toast.success(t("cancelOrder"));
        router.refresh();
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleCancel} disabled={isPending}>
      {isPending && <Loader2 className="size-4 animate-spin" />}
      {isPending ? t("cancelling") : t("cancelOrder")}
    </Button>
  );
}
