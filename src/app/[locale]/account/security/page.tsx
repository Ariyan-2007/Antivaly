import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChangePasswordForm } from "@/components/account/change-password-form";

export const metadata: Metadata = { title: "Security", robots: { index: false } };

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("changePasswordTitle")}</h1>
      <div className="rounded-xl border border-border p-5">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
