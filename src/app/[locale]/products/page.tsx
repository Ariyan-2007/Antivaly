import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductListing } from "@/components/shop/product-listing";
import { getBusiness, getCategories, getProducts, getProductFacets } from "@/lib/api/catalog";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { parseCatalogSearchParams, isFilteredView, type RawSearchParams } from "@/lib/shop/catalog-query";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const canonical = `/${locale}/products`;
  const q = sp.q as string | undefined;

  if (q) {
    return {
      title: `Search: ${q}`,
      robots: { index: false, follow: true },
      alternates: { canonical },
    };
  }

  return {
    title: "All Products",
    description: "Browse our full range of products.",
    alternates: { canonical },
    robots: isFilteredView(sp) ? { index: false, follow: true } : undefined,
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { locale } = await params;
  const rawSearchParams = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("listing");

  const query = parseCatalogSearchParams(rawSearchParams);
  const q = rawSearchParams.q as string | undefined;

  const [business, categories, page, facets] = await Promise.all([
    getBusiness(),
    getCategories().catch(() => []),
    getProducts(query),
    getProductFacets(query),
  ]);

  return (
    <ProductListing
      title={q ? t("searchResultsFor", { query: q }) : t("title")}
      page={page}
      facets={facets}
      sort={query.sort ?? "Relevance"}
      categories={categories}
      currency={business.currency || DEFAULT_CURRENCY}
      locale={locale}
    />
  );
}
