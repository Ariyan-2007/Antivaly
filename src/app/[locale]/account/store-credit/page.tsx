import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StoreCreditCard } from "@/components/account/store-credit-card";
import { GiftCardLookup } from "@/components/account/gift-card-lookup";
import { serverAuthedFetch } from "@/lib/auth/authed-fetch";
import type { StoreCreditBalanceResponse } from "@/types/api";

export const metadata: Metadata = { title: "Store Credit", robots: { index: false } };

export default async function StoreCreditPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const storeCredit = await serverAuthedFetch<StoreCreditBalanceResponse>(
    "/api/shop/account/store-credit"
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("storeCreditTitle")}</h1>

      {storeCredit.data && (
        <div className="rounded-xl border border-border p-5">
          <StoreCreditCard balance={storeCredit.data} locale={locale} />
        </div>
      )}

      <div className="rounded-xl border border-border p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{t("giftCardTitle")}</h2>
        <GiftCardLookup />
      </div>
    </div>
  );
}
