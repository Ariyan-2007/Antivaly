"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription, AlertAction } from "@/components/ui/alert";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";

/** Shown when `session.status === "PendingVerification"` — the account page previously gave
 * no indication of verification status at all, let alone a way to resend the email. */
export function EmailVerificationBanner() {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function handleResend() {
    startTransition(async () => {
      try {
        await browserFetch("/api/auth/resend-verification", { method: "POST" });
        setSent(true);
        toast.success(t("verificationResentToast"));
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  return (
    <Alert>
      <Mail />
      <AlertTitle>{t("verificationPendingTitle")}</AlertTitle>
      <AlertDescription>{t("verificationPendingDescription")}</AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline" onClick={handleResend} disabled={isPending || sent}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {sent ? t("verificationResent") : t("resendVerification")}
        </Button>
      </AlertAction>
    </Alert>
  );
}
