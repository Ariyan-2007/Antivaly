import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CartView } from "@/components/cart/cart-view";
import { getServerSession } from "@/lib/auth/session";
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
  const [session, business] = await Promise.all([getServerSession(), getBusiness()]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-heading mb-6 text-2xl font-bold text-foreground">{t("title")}</h1>
      {!session ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="max-w-sm text-muted-foreground">{t("signInDesc")}</p>
          <Button render={<Link href="/login">{t("signInTitle")}</Link>} />
        </div>
      ) : (
        <CartView currency={business.currency || DEFAULT_CURRENCY} />
      )}
    </div>
  );
}
