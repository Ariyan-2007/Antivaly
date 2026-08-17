import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";
import { ProductListing } from "@/components/shop/product-listing";
import { getBusiness, getCategories } from "@/lib/api/catalog";
import { DEFAULT_CURRENCY, DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/constants";
import { categoryHref } from "@/lib/routes";
import { getParentCategory } from "@/lib/shop/category-tree";
import { getCategoryTreeListing } from "@/lib/shop/category-listing";
import { parseCatalogSearchParams, isFilteredView, type RawSearchParams } from "@/lib/shop/catalog-query";

type Props = {
  params: Promise<{ locale: string; id: string; slug: string }>;
  searchParams: Promise<RawSearchParams>;
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

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, id, slug } = await params;
  const sp = await searchParams;
  const category = await findCategory(id);
  if (!category) return {};

  return {
    title: category.name || undefined,
    description: category.description || category.name || undefined,
    alternates: {
      canonical: `/${locale}/categories/${id}/${slug}`,
      languages: { en: `/en/categories/${id}/${slug}`, bn: `/bn/categories/${id}/${slug}` },
    },
    openGraph: { images: [category.imageUrl || DEFAULT_OG_IMAGE] },
    robots: isFilteredView(sp) ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, id } = await params;
  const rawSearchParams = await searchParams;
  setRequestLocale(locale);

  const [business, categories, category] = await Promise.all([
    getBusiness(),
    getCategories().catch(() => []),
    findCategory(id),
  ]);

  if (!category) notFound();

  const query = { ...parseCatalogSearchParams(rawSearchParams), categoryId: id };
  const { page, facets } = await getCategoryTreeListing(categories, category, query);

  const parent = getParentCategory(categories, category);
  const categoryName = category.name || "";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/${locale}` },
      ...(parent
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: parent.name || "",
              item: `${SITE_URL}/${locale}${categoryHref(parent.id, parent.slug)}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: parent ? 3 : 2,
        name: categoryName,
        item: `${SITE_URL}/${locale}${categoryHref(category.id, category.slug)}`,
      },
    ],
  };

  const breadcrumb = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/">Home</Link>} />
        </BreadcrumbItem>
        {parent && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link href={categoryHref(parent.id, parent.slug)}>{parent.name || ""}</Link>}
              />
            </BreadcrumbItem>
          </>
        )}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="line-clamp-1">{categoryName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductListing
        title={categoryName}
        page={page}
        facets={facets}
        sort={query.sort ?? "Relevance"}
        categories={categories}
        activeCategory={category}
        currency={business.currency || DEFAULT_CURRENCY}
        locale={locale}
        breadcrumb={breadcrumb}
      />
    </>
  );
}
