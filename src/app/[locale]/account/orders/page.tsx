import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { OrderCard } from "@/components/orders/order-card";
import { PaginationControls } from "@/components/shop/pagination-controls";
import { serverAuthedFetch } from "@/lib/auth/authed-fetch";
import { getBusiness } from "@/lib/api/catalog";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import type { OrderResponse, PagedResult } from "@/types/api";

export const metadata: Metadata = { title: "My Orders", robots: { index: false } };

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageRaw } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("orders");

  const page = Math.max(1, Number(pageRaw) || 1);
  const [business, result] = await Promise.all([
    getBusiness(),
    serverAuthedFetch<PagedResult<OrderResponse>>(`/api/shop/orders?page=${page}&pageSize=10`),
  ]);
  const orders = result.data?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("title")}</h1>
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
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} currency={business.currency || DEFAULT_CURRENCY} />
            ))}
          </div>
          {result.data && (
            <PaginationControls
              page={result.data.page}
              totalPages={result.data.totalPages}
              hasNextPage={result.data.hasNextPage}
              hasPreviousPage={result.data.hasPreviousPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
