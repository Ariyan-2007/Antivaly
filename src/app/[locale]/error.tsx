"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-heading text-xl font-bold text-foreground">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("description")}</p>
      <div className="flex gap-3">
        <Button variant="outline" render={<Link href="/">{t("goHome")}</Link>} />
        <Button onClick={() => reset()} className="gap-1.5">
          <RotateCw className="size-4" />
          {t("retry")}
        </Button>
      </div>
    </div>
  );
}
