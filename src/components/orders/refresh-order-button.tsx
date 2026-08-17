"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Order tracking has no push channel (blueprint §6.4) — re-fetching is the only way to see
 * a status change, so this just re-runs the page's server-side fetch (already `no-store`). */
export function RefreshOrderButton() {
  const t = useTranslations("orders");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw className={cn("size-3.5", isPending && "animate-spin")} />
      {t("refreshStatus")}
    </Button>
  );
}
