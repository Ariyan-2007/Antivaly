import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DeleteAccountDialog } from "@/components/account/delete-account-dialog";

export const metadata: Metadata = { title: "Delete Account", robots: { index: false } };

export default async function DeleteAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("dangerZone")}</h1>
      <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h2 className="text-sm font-semibold text-destructive">{t("deleteAccount")}</h2>
        <p className="text-sm text-muted-foreground">{t("deleteAccountWarning")}</p>
        <DeleteAccountDialog />
      </div>
    </div>
  );
}
