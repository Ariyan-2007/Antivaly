import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CartView } from "@/components/cart/cart-view";
import { getBusiness } from "@/lib/api/catalog";
import { DEFAULT_CURRENCY } from "@/lib/constants";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cart");
  const business = await getBusiness();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-heading mb-6 text-2xl font-bold text-foreground">{t("title")}</h1>
      <CartView currency={business.currency || DEFAULT_CURRENCY} />
    </div>
  );
}
