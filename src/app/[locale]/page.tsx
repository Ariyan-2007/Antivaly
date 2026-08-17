import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroBanner } from "@/components/shop/hero-banner";
import { ProductGrid } from "@/components/shop/product-grid";
import { Button } from "@/components/ui/button";
import { getBusiness, getCategories, getProducts, getBanners } from "@/lib/api/catalog";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/constants";
import { categoryHref } from "@/lib/routes";
import { getTopLevelCategories, getChildCategories } from "@/lib/shop/category-tree";
import type { CategoryResponse, ProductResponse } from "@/types/api";

const PRODUCTS_PER_CATEGORY = 6;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  try {
    const business = await getBusiness();
    return {
      alternates: {
        canonical: `/${locale}`,
        languages: { en: "/en", bn: "/bn" },
      },
      openGraph: {
        title: business.name || "Antivaly",
        description: business.description || undefined,
        images: [business.bannerUrl || DEFAULT_OG_IMAGE],
      },
    };
  } catch {
    return {};
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const business = await getBusiness();
  // Non-critical sections degrade independently rather than taking the whole page down:
  // a category-fetch failure just means no category rows; one bad category's products
  // failing doesn't hide every other category's products.
  const categories = await getCategories().catch(() => []);
  const banners = await getBanners().catch(() => []);
  // Top-level categories get first crack at their own home-page row. `categoryId` matching
  // is exact (no backend support for "include descendants"), and it's common for a catalog
  // to file every product under a leaf subcategory rather than the parent itself — so a
  // parent with zero directly-assigned products falls back to one row per child that does
  // have products, instead of silently disappearing from the homepage.
  const topLevelCategories = getTopLevelCategories(categories).filter((c) => c.isActive);

  const ownResults = await Promise.allSettled(
    topLevelCategories.map((category) =>
      getProducts({ categoryId: category.id, pageSize: PRODUCTS_PER_CATEGORY })
    )
  );

  const emptyParents = topLevelCategories.filter(
    (category, i) => ownResults[i].status !== "fulfilled" || ownResults[i].value.items.length === 0
  );
  const fallbackChildren = emptyParents.flatMap((category) =>
    getChildCategories(categories, category.id).filter((c) => c.isActive)
  );
  const childResults = await Promise.allSettled(
    fallbackChildren.map((category) =>
      getProducts({ categoryId: category.id, pageSize: PRODUCTS_PER_CATEGORY })
    )
  );

  const categoryRows: { category: CategoryResponse; products: ProductResponse[] }[] = [];
  topLevelCategories.forEach((category, i) => {
    const result = ownResults[i];
    const products = result.status === "fulfilled" ? result.value.items : [];
    if (products.length > 0) {
      categoryRows.push({ category, products });
    } else {
      getChildCategories(categories, category.id)
        .filter((c) => c.isActive)
        .forEach((child) => {
          const childIndex = fallbackChildren.findIndex((c) => c.id === child.id);
          const childResult = childResults[childIndex];
          const childProducts = childResult?.status === "fulfilled" ? childResult.value.items : [];
          if (childProducts.length > 0) categoryRows.push({ category: child, products: childProducts });
        });
    }
  });

  const businessName = business.name || "Antivaly";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: businessName,
    url: `${SITE_URL}/${locale}`,
    logo: business.logoUrl || undefined,
    email: business.contactEmail || undefined,
    telephone: business.contactPhone || undefined,
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HeroBanner business={business} banners={banners} />

      {categoryRows.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("noProducts")}</p>
      ) : (
        categoryRows.map(({ category, products }) => (
          <section key={category.id} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                {category.name || ""}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                render={
                  <Link href={categoryHref(category.id, category.slug)}>
                    {t("exploreProducts")}
                  </Link>
                }
              />
            </div>
            <ProductGrid
              products={products.slice(0, PRODUCTS_PER_CATEGORY)}
              currency={business.currency || "USD"}
              locale={locale}
            />
          </section>
        ))
      )}
    </div>
  );
}
