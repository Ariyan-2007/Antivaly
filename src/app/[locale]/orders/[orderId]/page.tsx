import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { getServerSession } from "@/lib/auth/session";
import { serverAuthedFetch } from "@/lib/auth/authed-fetch";
import { getBusiness } from "@/lib/api/catalog";
import type { OrderResponse } from "@/types/api";

export const metadata: Metadata = { title: "Order Details", robots: { index: false } };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("orders");
  const session = await getServerSession();
  if (!session) {
    redirect(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/orders/${orderId}`)}`);
  }

  const [business, result] = await Promise.all([
    getBusiness(),
    serverAuthedFetch<OrderResponse>(`/api/shop/orders/${orderId}`),
  ]);

  if (result.error === "unavailable") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-muted-foreground">{t("loadError")}</p>
      </div>
    );
  }

  if (!result.data) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <OrderDetailView order={result.data} business={business} locale={locale} />
    </div>
  );
}
