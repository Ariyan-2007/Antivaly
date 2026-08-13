import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProfileForm } from "@/components/account/profile-form";
import { getServerSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const session = await getServerSession();
  if (!session) {
    redirect(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/account`)}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-heading mb-6 text-2xl font-bold text-foreground">{t("title")}</h1>
      <div className="rounded-xl border border-border p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{t("profileTitle")}</h2>
        <ProfileForm user={session} />
      </div>
      <Link
        href="/orders"
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        {t("myOrders")}
      </Link>
    </div>
  );
}
