import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { getBusiness } from "@/lib/api/catalog";
import { DEFAULT_CURRENCY } from "@/lib/constants";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");
  const business = await getBusiness();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2.5">
        <Link
          href="/cart"
          aria-label={t("backToCart")}
          className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground">{t("title")}</h1>
      </div>
      <CheckoutView currency={business.currency || DEFAULT_CURRENCY} />
    </div>
  );
}
