import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/order-status-badge";
import { CancelOrderButton } from "@/components/orders/cancel-order-button";
import { getServerSession } from "@/lib/auth/session";
import { serverAuthedFetch } from "@/lib/auth/authed-fetch";
import { getBusiness } from "@/lib/api/catalog";
import { formatDate, formatMoney } from "@/lib/format";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import type { OrderResponse, OrderStatus } from "@/types/api";

export const metadata: Metadata = { title: "Order Details", robots: { index: false } };

const CANCELLABLE = new Set<OrderStatus>(["PendingPayment", "Processing", "Confirmed"]);

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("orders");
  const tc = await getTranslations("common");
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
  const order = result.data;
  const currency = business.currency || DEFAULT_CURRENCY;
  const items = order.items ?? [];
  const address = order.shippingAddress;
  const addressLine = address
    ? [address.line1, address.line2, address.city, address.state, address.postalCode, address.country]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {t("orderNumber", { number: order.orderNumber ?? orderId.slice(0, 8) })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("placedOn", { date: formatDate(order.placedAt, locale) })}
          </p>
        </div>
        <div className="flex gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">{t("items")}</h2>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.productName || tc("unnamedItem")} × {item.quantity}
              </span>
              <span>{formatMoney(item.lineTotal, currency, locale)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tc("subtotal")}</span>
            <span>{formatMoney(order.subtotal, currency, locale)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tc("discount")}</span>
              <span>-{formatMoney(order.discountAmount, currency, locale)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tc("deliveryFee")}</span>
            <span>{formatMoney(order.deliveryFee, currency, locale)}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-bold text-foreground">
            <span>{tc("total")}</span>
            <span>{formatMoney(order.total, currency, locale)}</span>
          </div>
        </div>
      </div>

      {address && (
        <div className="mt-4 rounded-xl border border-border p-5">
          <h2 className="mb-2 text-sm font-semibold text-foreground">{t("shippingTo")}</h2>
          {addressLine && <p className="text-sm text-muted-foreground">{addressLine}</p>}
          {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
        </div>
      )}

      {CANCELLABLE.has(order.status) && (
        <div className="mt-6">
          <CancelOrderButton orderId={order.id} />
        </div>
      )}
    </div>
  );
}
