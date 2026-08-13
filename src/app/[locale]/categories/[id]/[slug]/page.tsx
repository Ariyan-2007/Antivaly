import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ProductListing } from "@/components/shop/product-listing";
import { getBusiness, getCategories, getProducts } from "@/lib/api/catalog";
import { DEFAULT_CURRENCY } from "@/lib/constants";

type Props = {
  params: Promise<{ locale: string; id: string; slug: string }>;
};

async function findCategory(id: string) {
  try {
    const categories = await getCategories();
    return categories.find((c) => c.id === id) ?? null;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  // Falls back to on-demand rendering (dynamicParams) if the API is unreachable at build
  // time — a prebuild-time outage shouldn't fail the whole build.
  try {
    const categories = await getCategories();
    return categories.map((c) => ({ id: c.id, slug: c.slug || c.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id, slug } = await params;
  const category = await findCategory(id);
  if (!category) return {};

  return {
    title: category.name || undefined,
    description: category.description || category.name || undefined,
    alternates: { canonical: `/${locale}/categories/${id}/${slug}` },
    openGraph: category.imageUrl ? { images: [category.imageUrl] } : undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [business, categories, category] = await Promise.all([
    getBusiness(),
    getCategories().catch(() => []),
    findCategory(id),
  ]);

  if (!category) notFound();

  const products = await getProducts({ categoryId: id }).catch(() => []);

  return (
    <ProductListing
      title={category.name || ""}
      products={products}
      categories={categories}
      activeCategoryId={id}
      currency={business.currency || DEFAULT_CURRENCY}
      locale={locale}
    />
  );
}
