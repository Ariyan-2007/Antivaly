import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReturnForm } from "@/components/orders/return-form";
import { serverAuthedFetch } from "@/lib/auth/authed-fetch";
import { getBusiness } from "@/lib/api/catalog";
import { isReturnEligible } from "@/components/orders/order-detail-view";
import type { OrderResponse } from "@/types/api";

export const metadata: Metadata = { title: "Return Items", robots: { index: false } };

export default async function ReturnRequestPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("returns");

  const [business, result] = await Promise.all([
    getBusiness(),
    serverAuthedFetch<OrderResponse>(`/api/shop/orders/${orderId}`),
  ]);

  if (!result.data || !isReturnEligible(result.data, business)) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("startReturn")}</h1>
      <ReturnForm orderId={result.data.id} items={result.data.items ?? []} />
    </div>
  );
}
