import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VerifyEmailStatus } from "@/components/auth/verify-email-status";

export const metadata: Metadata = { title: "Verify Email", robots: { index: false } };

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("verifyEmail");

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-2 px-4 py-16">
      <h1 className="font-heading text-center text-2xl font-bold text-foreground">{t("title")}</h1>
      <Suspense>
        <VerifyEmailStatus />
      </Suspense>
    </div>
  );
}
