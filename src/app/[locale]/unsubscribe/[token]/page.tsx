import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MailX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { unsubscribe } from "@/lib/api/auth";

export const metadata: Metadata = { title: "Unsubscribed", robots: { index: false } };

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("unsubscribe");

  // Always resolves — nothing to branch on (blueprint §9.36).
  await unsubscribe(token);

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 px-4 py-24 text-center">
      <MailX className="size-10 text-primary" />
      <h1 className="font-heading text-xl font-bold text-foreground">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("description")}</p>
      <Button render={<Link href="/">{t("backHome")}</Link>} />
    </div>
  );
}
