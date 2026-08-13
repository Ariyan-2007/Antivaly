"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const nextLocale = locale === "en" ? "bn" : "en";

  function switchLocale() {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <Button variant="ghost" size="sm" onClick={switchLocale} className="font-semibold">
      {nextLocale === "en" ? "EN" : "বাংলা"}
    </Button>
  );
}
