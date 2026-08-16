import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProfileForm } from "@/components/account/profile-form";
import { StoreCreditCard } from "@/components/account/store-credit-card";
import { GiftCardLookup } from "@/components/account/gift-card-lookup";
import { NotificationPreferencesForm } from "@/components/account/notification-preferences-form";
import { DataExportButton } from "@/components/account/data-export-button";
import { DeleteAccountDialog } from "@/components/account/delete-account-dialog";
import { getServerSession } from "@/lib/auth/session";
import { serverAuthedFetch } from "@/lib/auth/authed-fetch";
import type { StoreCreditBalanceResponse } from "@/types/api";

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

  const storeCredit = await serverAuthedFetch<StoreCreditBalanceResponse>(
    "/api/shop/account/store-credit"
  );

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("title")}</h1>

      <div className="rounded-xl border border-border p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{t("profileTitle")}</h2>
        <ProfileForm user={session} />
      </div>

      <div className="flex flex-wrap gap-4 text-sm font-medium text-primary">
        <Link href="/orders" className="hover:underline">
          {t("myOrders")}
        </Link>
        <Link href="/account/wishlist" className="hover:underline">
          {t("myWishlist")}
        </Link>
        <Link href="/account/returns" className="hover:underline">
          {t("myReturns")}
        </Link>
      </div>

      {storeCredit.data && (
        <div className="rounded-xl border border-border p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t("storeCreditTitle")}</h2>
          <StoreCreditCard balance={storeCredit.data} locale={locale} />
        </div>
      )}

      <div className="rounded-xl border border-border p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{t("giftCardTitle")}</h2>
        <GiftCardLookup />
      </div>

      <div className="rounded-xl border border-border p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{t("notificationsTitle")}</h2>
        <NotificationPreferencesForm />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground">{t("dataTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("dataDescription")}</p>
        <DataExportButton />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h2 className="text-sm font-semibold text-destructive">{t("dangerZone")}</h2>
        <p className="text-sm text-muted-foreground">{t("deleteAccountWarning")}</p>
        <DeleteAccountDialog />
      </div>
    </div>
  );
}
