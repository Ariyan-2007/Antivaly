import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NotificationPreferencesForm } from "@/components/account/notification-preferences-form";

export const metadata: Metadata = { title: "Notification Preferences", robots: { index: false } };

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("notificationsTitle")}</h1>
      <div className="rounded-xl border border-border p-5">
        <NotificationPreferencesForm />
      </div>
    </div>
  );
}
