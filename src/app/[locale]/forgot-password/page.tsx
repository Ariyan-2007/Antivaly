import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot Password", robots: { index: false } };

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">{t("forgotTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("forgotSubtitle")}</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
