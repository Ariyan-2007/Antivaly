import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroBanner } from "@/components/shop/hero-banner";
import { TrustStatBand } from "@/components/shop/trust-stat-band";
import { AppInstallBand } from "@/components/shop/app-install-band";
import { ProductGrid } from "@/components/shop/product-grid";
import { SectionHeading } from "@/components/shop/section-heading";
import { getBusiness, getCategories, getProducts, getBanners } from "@/lib/api/catalog";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/constants";
import { categoryHref } from "@/lib/routes";
import { getTopLevelCategories, getChildCategories } from "@/lib/shop/category-tree";
import type { CategoryResponse, ProductResponse } from "@/types/api";

const PRODUCTS_PER_CATEGORY = 6;
const DEALS_LIMIT = 8;
const BEST_SELLERS_LIMIT = 8;

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
  const topLevelCategories = getTopLevelCategories(categories).filter((c) => c.isActive);

  const [ownResults, dealsPool, bestSellers] = await Promise.all([
    Promise.allSettled(
      topLevelCategories.map((category) =>
        getProducts({ categoryId: category.id, pageSize: PRODUCTS_PER_CATEGORY })
      )
    ),
    // No backend filter for "has an active discount" — pull a wider pool sorted by
    // merchandising relevance and pick out the discounted ones client-side rather than
    // mislabeling a merchant "featured" flag as a real deal.
    getProducts({ sort: "Relevance", pageSize: 48 }).catch(() => null),
    getProducts({ sort: "BestSelling", pageSize: BEST_SELLERS_LIMIT }).catch(() => null),
  ]);

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

  const deals = (dealsPool?.items ?? [])
    .filter((p) => (p.discountPercent ?? 0) > 0)
    .slice(0, DEALS_LIMIT);
  const bestSellerItems = bestSellers?.items ?? [];

  const businessName = business.name || "Antivaly";
  const currency = business.currency || "USD";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: businessName,
    url: `${SITE_URL}/${locale}`,
    logo: business.logoUrl || undefined,
    email: business.contactEmail || undefined,
    telephone: business.contactPhone || undefined,
  };

  const isEmpty = categoryRows.length === 0 && deals.length === 0 && bestSellerItems.length === 0;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HeroBanner business={business} banners={banners} />

      <TrustStatBand deliveryModuleEnabled={business.deliveryModuleEnabled} />

      {isEmpty ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("noProducts")}</p>
      ) : (
        <>
          {deals.length > 0 && (
            <section className="flex flex-col gap-4 rounded-2xl bg-primary/5 p-5 ring-1 ring-primary/10 sm:p-7">
              <SectionHeading
                eyebrow={t("dealsEyebrow")}
                title={t("dealsTitle")}
                subtitle={t("dealsSubtitle")}
                viewAllHref="/products?sort=PriceAscending"
                viewAllLabel={t("dealsViewAll")}
              />
              <ProductGrid products={deals} currency={currency} locale={locale} />
            </section>
          )}

          {categoryRows.map(({ category, products }) => (
            <section key={category.id} className="flex flex-col gap-4">
              <SectionHeading
                eyebrow={t("categoryKicker")}
                title={category.name || ""}
                viewAllHref={categoryHref(category.id, category.slug)}
                viewAllLabel={t("exploreProducts")}
              />
              <ProductGrid
                products={products.slice(0, PRODUCTS_PER_CATEGORY)}
                currency={currency}
                locale={locale}
              />
            </section>
          ))}

          {bestSellerItems.length > 0 && (
            <section className="flex flex-col gap-4">
              <SectionHeading
                eyebrow={t("bestSellersEyebrow")}
                title={t("bestSellersTitle")}
                subtitle={t("bestSellersSubtitle")}
                viewAllHref="/products?sort=BestSelling"
                viewAllLabel={t("exploreProducts")}
              />
              <ProductGrid products={bestSellerItems} currency={currency} locale={locale} />
            </section>
          )}
        </>
      )}

      <AppInstallBand />
    </div>
  );
}
