"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/lib/pwa/use-install-prompt";

const DISMISS_KEY = "antivaly-install-banner-dismissed";

/** Mobile-only "add to home screen" strip above the header — mirrors the design mockup's
 * `showInstall` banner. Renders nothing until the browser has genuinely offered installability
 * (see useInstallPrompt) or once dismissed for this browsing session. */
export function InstallAppBanner() {
  const t = useTranslations("pwa");
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (!canInstall || dismissed) return null;

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="flex items-center gap-3 bg-foreground px-4 py-2.5 text-xs text-background md:hidden">
      <Image src="/brand/icon-192.png" alt="" width={28} height={28} className="size-7 shrink-0 rounded-lg" />
      <span className="min-w-0 flex-1">
        <strong className="font-bold">{t("installTitle")}</strong> — {t("installDescription")}
      </span>
      <Button size="sm" className="shrink-0 rounded-full" onClick={promptInstall}>
        {t("installButton")}
      </Button>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="shrink-0 text-background/60 hover:text-background"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
