import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { OrderCard } from "@/components/orders/order-card";
import { getServerSession } from "@/lib/auth/session";
import { serverAuthedFetch } from "@/lib/auth/authed-fetch";
import { getBusiness } from "@/lib/api/catalog";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import type { OrderResponse } from "@/types/api";

export const metadata: Metadata = { title: "My Orders", robots: { index: false } };

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("orders");
  const session = await getServerSession();
  if (!session) {
    redirect(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/orders`)}`);
  }

  const [business, result] = await Promise.all([
    getBusiness(),
    serverAuthedFetch<OrderResponse[]>("/api/shop/orders"),
  ]);
  const orders = result.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading mb-6 text-2xl font-bold text-foreground">{t("title")}</h1>
      {result.error === "unavailable" ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-muted-foreground">{t("loadError")}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-muted-foreground">{t("empty")}</p>
          <Button render={<Link href="/products">{t("emptyCta")}</Link>} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} currency={business.currency || DEFAULT_CURRENCY} />
          ))}
        </div>
      )}
    </div>
  );
}
