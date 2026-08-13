import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Log In", robots: { index: false } };

export default async function LoginPage({
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
        <h1 className="font-heading text-2xl font-bold text-foreground">{t("loginTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("loginSubtitle")}</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
