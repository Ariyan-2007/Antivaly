import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductListing } from "@/components/shop/product-listing";
import { getBusiness, getCategories, getProducts } from "@/lib/api/catalog";
import { DEFAULT_CURRENCY } from "@/lib/constants";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  if (q) {
    return {
      title: `Search: ${q}`,
      robots: { index: false, follow: true },
    };
  }
  return { title: "All Products" };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("listing");

  const [business, categories, products] = await Promise.all([
    getBusiness(),
    getCategories().catch(() => []),
    getProducts({ search: q }).catch(() => []),
  ]);

  return (
    <ProductListing
      title={q ? t("searchResultsFor", { query: q }) : t("title")}
      products={products}
      categories={categories}
      currency={business.currency || DEFAULT_CURRENCY}
      locale={locale}
    />
  );
}
