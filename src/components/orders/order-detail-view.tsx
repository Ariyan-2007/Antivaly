import { getTranslations } from "next-intl/server";
import { Truck, ExternalLink } from "lucide-react";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/order-status-badge";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { CancelOrderButton } from "@/components/orders/cancel-order-button";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { formatDate, formatMoney } from "@/lib/format";
import type { BusinessResponse, OrderResponse, OrderStatus } from "@/types/api";

const CANCELLABLE = new Set<OrderStatus>(["PendingPayment", "Processing", "Confirmed"]);
const MS_PER_DAY = 86_400_000;

export function isReturnEligible(order: OrderResponse, business: BusinessResponse): boolean {
  if (order.status !== "Delivered" || business.returnWindowDays <= 0) return false;
  const deliveredEvent = (order.statusHistory ?? []).find((e) => e.status === "Delivered");
  const since = new Date(deliveredEvent?.timestamp ?? order.placedAt).getTime();
  if (Number.isNaN(since)) return true;
  const daysSince = (Date.now() - since) / MS_PER_DAY;
  return daysSince <= business.returnWindowDays;
}

/** Shared between the authed order-detail page and the guest order-tracking page. */
export async function OrderDetailView({
  order,
  business,
  locale,
  interactive = true,
}: {
  order: OrderResponse;
  business: BusinessResponse;
  locale: string;
  /** false for the guest tracking page — no session to authorize cancel/return actions. */
  interactive?: boolean;
}) {
  const t = await getTranslations("orders");
  const tc = await getTranslations("common");

  const items = order.items ?? [];
  const discounts = order.discounts ?? [];
  const address = order.shippingAddress;
  const addressLine = address
    ? [address.line1, address.line2, address.city, address.state, address.postalCode, address.country]
        .filter(Boolean)
        .join(", ")
    : "";
  const taxDisplayName = business.tax.displayName || tc("tax");
  const canReturn = interactive && isReturnEligible(order, business);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {t("orderNumber", { number: order.orderNumber ?? order.id.slice(0, 8) })}
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

      <div className="rounded-xl border border-border p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">{t("items")}</h2>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.productName || tc("unnamedItem")}
                {item.variantSummary ? ` (${item.variantSummary})` : ""} × {item.quantity}
                {item.refundedQuantity > 0 && (
                  <span className="ml-1 text-xs text-primary">
                    ({t("returnedQuantity", { count: item.refundedQuantity })})
                  </span>
                )}
              </span>
              <span>{formatMoney(item.lineTotal, currency(order), locale)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tc("subtotal")}</span>
            <span>{formatMoney(order.subtotal, currency(order), locale)}</span>
          </div>
          {discounts.map((d, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-muted-foreground">{d.label || tc("discount")}</span>
              <span>-{formatMoney(d.amount, currency(order), locale)}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tc("deliveryFee")}</span>
            <span>{formatMoney(order.deliveryFee, currency(order), locale)}</span>
          </div>
          {order.taxAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {taxDisplayName}
                {order.pricesIncludeTax ? ` (${t("taxIncludedShort")})` : ""}
              </span>
              <span>{formatMoney(order.taxAmount, currency(order), locale)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 text-base font-bold text-foreground">
            <span>{tc("total")}</span>
            <span>{formatMoney(order.total, currency(order), locale)}</span>
          </div>
          {(order.giftCardsUsed ?? []).map((gc) => (
            <div key={gc.codeSuffix} className="flex justify-between text-muted-foreground">
              <span>{t("giftCardUsed", { suffix: gc.codeSuffix })}</span>
              <span>-{formatMoney(gc.amountApplied, currency(order), locale)}</span>
            </div>
          ))}
          {order.storeCreditApplied > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{t("storeCreditApplied")}</span>
              <span>-{formatMoney(order.storeCreditApplied, currency(order), locale)}</span>
            </div>
          )}
          {order.amountDue !== order.total && (
            <div className="flex justify-between text-sm font-semibold text-primary">
              <span>{t("amountDue")}</span>
              <span>{formatMoney(order.amountDue, currency(order), locale)}</span>
            </div>
          )}
          {order.refundedAmount > 0 && (
            <div className="flex justify-between text-sm font-medium text-primary">
              <span>{t("refundedAmount")}</span>
              <span>{formatMoney(order.refundedAmount, currency(order), locale)}</span>
            </div>
          )}
        </div>
      </div>

      {(order.statusHistory ?? []).length > 0 && (
        <OrderStatusTimeline events={order.statusHistory ?? []} locale={locale} />
      )}

      {(order.carrierName || order.trackingNumber) && (
        <div className="rounded-xl border border-border p-5">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Truck className="size-4" />
            {t("tracking")}
          </h2>
          {order.carrierName && <p className="text-sm text-muted-foreground">{order.carrierName}</p>}
          {order.trackingNumber && (
            <p className="text-sm text-muted-foreground">
              {t("trackingNumber")}: {order.trackingNumber}
            </p>
          )}
          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t("trackShipment")}
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      )}

      {address && (
        <div className="rounded-xl border border-border p-5">
          <h2 className="mb-2 text-sm font-semibold text-foreground">{t("shippingTo")}</h2>
          {addressLine && <p className="text-sm text-muted-foreground">{addressLine}</p>}
          {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
        </div>
      )}

      {interactive && (CANCELLABLE.has(order.status) || canReturn) && (
        <div className="flex gap-2">
          {CANCELLABLE.has(order.status) && <CancelOrderButton orderId={order.id} />}
          {canReturn && (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/orders/${order.id}/return`}>{t("returnItems")}</Link>}
            />
          )}
        </div>
      )}
    </div>
  );
}

function currency(order: OrderResponse): string {
  return order.currency || "USD";
}
