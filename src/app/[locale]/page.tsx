import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroBanner } from "@/components/shop/hero-banner";
import { ProductGrid } from "@/components/shop/product-grid";
import { Button } from "@/components/ui/button";
import { getBusiness, getCategories, getProducts, getBanners } from "@/lib/api/catalog";
import { API_BASE_URL, BUSINESS_SLUG } from "@/lib/constants";
import { categoryHref } from "@/lib/routes";

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
  const activeCategories = categories
    .filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const categoryProductsSettled = await Promise.allSettled(
    activeCategories.map((category) =>
      getProducts({ categoryId: category.id, pageSize: PRODUCTS_PER_CATEGORY })
    )
  );
  const categoryProducts = categoryProductsSettled.map((r) =>
    r.status === "fulfilled" ? r.value.items : []
  );

  const businessName = business.name || "Antivaly";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: businessName,
    url: `${API_BASE_URL}/shop/${BUSINESS_SLUG}`,
    logo: business.logoUrl || undefined,
    email: business.contactEmail || undefined,
    telephone: business.contactPhone || undefined,
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HeroBanner business={business} banners={banners} />

      {activeCategories.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("noProducts")}</p>
      ) : (
        activeCategories.map((category, i) => {
          const products = categoryProducts[i];
          if (products.length === 0) return null;
          return (
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
          );
        })
      )}
    </div>
  );
}
