"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";

type State = "verifying" | "success" | "error" | "missing-token";

export function VerifyEmailStatus() {
  const t = useTranslations("verifyEmail");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<State>(token ? "verifying" : "missing-token");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    browserFetch("/api/auth/verify-email", { method: "POST", body: { token } })
      .then(() => {
        if (!cancelled) setState("success");
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(err instanceof ApiError ? err.message : "");
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === "verifying") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("verifying")}</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="size-10 text-primary" />
        <p className="text-sm text-foreground">{t("success")}</p>
        <Button render={<Link href="/login">{t("continueToLogin")}</Link>} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <XCircle className="size-10 text-destructive" />
      <p className="text-sm text-foreground">
        {state === "missing-token" ? t("missingToken") : errorMessage || t("failed")}
      </p>
      <Button variant="outline" render={<Link href="/">{t("backHome")}</Link>} />
    </div>
  );
}
