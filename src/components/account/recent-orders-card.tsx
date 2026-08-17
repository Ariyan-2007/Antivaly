import { getTranslations } from "next-intl/server";
import { OrderCard } from "@/components/orders/order-card";
import { Link } from "@/i18n/navigation";
import type { OrderResponse } from "@/types/api";

/** Surfaced directly on the account page rather than making a signed-in customer click
 * through to "My Orders" and scan the list just to check on something recent. */
export async function RecentOrdersCard({
  orders,
  currency,
}: {
  orders: OrderResponse[];
  currency: string;
}) {
  const t = await getTranslations("account");
  const to = await getTranslations("orders");

  if (orders.length === 0) return null;

  return (
    <div className="rounded-xl border border-border p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{t("recentOrdersTitle")}</h2>
        <Link href="/account/orders" className="text-sm font-medium text-primary hover:underline">
          {to("title")}
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} currency={currency} />
        ))}
      </div>
    </div>
  );
}
