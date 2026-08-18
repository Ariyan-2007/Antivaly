import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatDate, formatMoney } from "@/lib/format";
import { orderHref } from "@/lib/routes";
import type { OrderResponse } from "@/types/api";

export function OrderCard({ order, currency }: { order: OrderResponse; currency: string }) {
  const t = useTranslations("orders");
  const locale = useLocale();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4">
      <div>
        <p className="text-sm font-bold text-foreground">
          {t("orderNumber", { number: order.orderNumber ?? order.id.slice(0, 8) })}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("placedOn", { date: formatDate(order.placedAt, locale) })}
        </p>
      </div>
      <OrderStatusBadge status={order.status} />
      <div className="flex items-center gap-3">
        <p className="text-sm font-extrabold text-foreground">
          {formatMoney(order.total, currency, locale)}
        </p>
        <Button
          variant="outline"
          size="sm"
          render={<Link href={orderHref(order.id)}>{t("viewDetails")}</Link>}
        />
      </div>
    </div>
  );
}
