import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AddressBook } from "@/components/account/address-book";
import { serverAuthedFetch } from "@/lib/auth/authed-fetch";
import type { AddressResponse } from "@/types/api";

export const metadata: Metadata = { title: "Saved Addresses", robots: { index: false } };

export default async function AddressesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const addresses = await serverAuthedFetch<AddressResponse[]>("/api/shop/account/addresses");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("addressesTitle")}</h1>
      <AddressBook initialAddresses={addresses.data ?? []} />
    </div>
  );
}
