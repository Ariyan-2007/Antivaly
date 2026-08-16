import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { getBusiness } from "@/lib/api/catalog";
import { lookupOrder } from "@/lib/api/orders";

export const metadata: Metadata = { title: "Track Order" };

export default async function TrackOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderNumber?: string; email?: string }>;
}) {
  const { locale } = await params;
  const { orderNumber, email } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("trackOrder");

  const business = await getBusiness();
  const searched = !!(orderNumber && email);
  const order = searched ? await lookupOrder(orderNumber!, email!) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading mb-2 text-2xl font-bold text-foreground">{t("title")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t("description")}</p>

      <form method="get" className="mb-8 flex flex-col gap-4 rounded-xl border border-border p-5 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="orderNumber">{t("orderNumber")}</Label>
          <Input id="orderNumber" name="orderNumber" defaultValue={orderNumber} required />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" defaultValue={email} required />
        </div>
        <Button type="submit">{t("submit")}</Button>
      </form>

      {searched && !order && (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("notFound")}</p>
      )}

      {order && <OrderDetailView order={order} business={business} locale={locale} interactive={false} />}
    </div>
  );
}
