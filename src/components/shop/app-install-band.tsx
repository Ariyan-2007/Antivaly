"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/lib/pwa/use-install-prompt";

/** Only renders once the browser has genuinely offered installability (see useInstallPrompt) —
 * never a dead "Install App" button that does nothing. */
export function AppInstallBand() {
  const t = useTranslations("pwa");
  const { canInstall, promptInstall } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <section className="relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl bg-foreground p-7 text-center sm:flex-row sm:justify-between sm:text-left">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_500px_260px_at_85%_50%,var(--color-primary),transparent)] opacity-30" />
      <div className="relative">
        <h2 className="font-heading text-xl font-bold text-background sm:text-2xl">{t("appBandTitle")}</h2>
        <p className="mt-1 max-w-sm text-sm text-background/65">{t("appBandDescription")}</p>
      </div>
      <Button size="lg" className="relative shrink-0 rounded-full" onClick={promptInstall}>
        {t("appBandButton")}
      </Button>
    </section>
  );
}
