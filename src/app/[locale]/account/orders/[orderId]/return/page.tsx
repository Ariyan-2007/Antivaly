import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReturnForm, type ExchangeableProduct } from "@/components/orders/return-form";
import { serverAuthedFetch } from "@/lib/auth/authed-fetch";
import { getBusiness, getProduct } from "@/lib/api/catalog";
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

  const items = result.data.items ?? [];

  // An Exchange offer is scoped to "same product, same price, different variant" (§9.49) — the
  // eligible-variant list has to come from the product's own current variant set, which isn't on
  // the order line itself. Fetched once here (server-side, cached) rather than from the client
  // form, so there's no extra browser-facing product-detail route to expose.
  const returnableProductIds = [
    ...new Set(items.filter((item) => item.quantity - item.refundedQuantity > 0).map((item) => item.productId)),
  ];
  const products = await Promise.all(returnableProductIds.map((id) => getProduct(id)));
  const exchangeableProducts: Record<string, ExchangeableProduct> = {};
  for (const product of products) {
    if (product) {
      exchangeableProducts[product.id] = { effectivePrice: product.effectivePrice, variants: product.variants ?? [] };
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("startReturn")}</h1>
      <ReturnForm orderId={result.data.id} items={items} exchangeableProducts={exchangeableProducts} />
    </div>
  );
}
