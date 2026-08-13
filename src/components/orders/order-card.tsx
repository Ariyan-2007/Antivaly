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
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground">
            {t("orderNumber", { number: order.orderNumber ?? order.id.slice(0, 8) })}
          </p>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {t("placedOn", { date: formatDate(order.placedAt, locale) })}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {formatMoney(order.total, currency, locale)}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        render={<Link href={orderHref(order.id)}>{t("viewDetails")}</Link>}
      />
    </div>
  );
}
