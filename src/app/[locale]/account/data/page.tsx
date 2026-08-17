import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataExportButton } from "@/components/account/data-export-button";

export const metadata: Metadata = { title: "Your Data", robots: { index: false } };

export default async function DataPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("dataTitle")}</h1>
      <div className="flex flex-col gap-3 rounded-xl border border-border p-5">
        <p className="text-sm text-muted-foreground">{t("dataDescription")}</p>
        <DataExportButton />
      </div>
    </div>
  );
}
