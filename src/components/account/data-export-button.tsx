"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import type { CustomerDataExport } from "@/types/api";

export function DataExportButton() {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      try {
        const data = await browserFetch<CustomerDataExport>("/api/shop/account/data-export");
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my-data.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isPending}>
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {t("exportData")}
    </Button>
  );
}
