import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { getServerSession } from "@/lib/auth/session";
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
  const [session, business] = await Promise.all([getServerSession(), getBusiness()]);

  if (!session) redirect(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/checkout`)}`);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-heading mb-6 text-2xl font-bold text-foreground">{t("title")}</h1>
      <CheckoutView currency={business.currency || DEFAULT_CURRENCY} />
    </div>
  );
}
