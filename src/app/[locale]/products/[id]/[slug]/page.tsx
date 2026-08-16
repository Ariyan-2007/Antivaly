import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";
import { ReviewsSection } from "@/components/shop/reviews-section";
import { RecommendedProducts } from "@/components/shop/recommended-products";
import { Badge } from "@/components/ui/badge";
import { Truck, Store } from "lucide-react";
import {
  getBusiness,
  getCategories,
  getProduct,
  getProducts,
  getReviewSummary,
  getProductReviews,
  getAlsoBought,
  getRelated,
} from "@/lib/api/catalog";
import { categoryHref } from "@/lib/routes";
import { DEFAULT_CURRENCY } from "@/lib/constants";

type Props = {
  params: Promise<{ locale: string; id: string; slug: string }>;
};

export async function generateStaticParams() {
  // Falls back to on-demand rendering (dynamicParams) if the API is unreachable at build
  // time — a prebuild-time outage shouldn't fail the whole build.
  try {
    const products = await getProducts({ pageSize: 100 });
    return products.items.map((p) => ({ id: p.id, slug: p.slug || p.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id, slug } = await params;
  const product = await getProduct(id);
  if (!product) return {};

  const images = product.images ?? [];
  return {
    title: product.metaTitle || product.name || undefined,
    description: product.metaDescription || product.description || product.name || undefined,
    alternates: { canonical: `/${locale}/products/${id}/${slug}` },
    openGraph: {
      title: product.name || undefined,
      description: product.description || undefined,
      images: images.length ? images : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product");

  const [business, categories, product] = await Promise.all([
    getBusiness(),
    getCategories().catch(() => []),
    getProduct(id),
  ]);

  if (!product) notFound();

  const currency = business.currency || DEFAULT_CURRENCY;
  const productName = product.name || "";
  const images = product.images ?? [];
  const tags = product.tags ?? [];
  const category = categories.find((c) => c.id === product.categoryId);

  const [reviewSummary, reviews, alsoBought, related] = await Promise.all([
    business.reviewsEnabled ? getReviewSummary(product.id) : Promise.resolve(null),
    business.reviewsEnabled
      ? getProductReviews(product.id, { page: 1, pageSize: 5 })
      : Promise.resolve(null),
    getAlsoBought(product.id).catch(() => []),
    getRelated(product.id).catch(() => []),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description: product.description || undefined,
    sku: product.sku || undefined,
    brand: product.brand || undefined,
    image: images,
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.averageRating,
            reviewCount: product.reviewCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: currency,
      price: product.effectivePrice,
      availability: product.isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `/${locale}` },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: category.name || "",
              item: `/${locale}${categoryHref(category.id, category.slug)}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: category ? 3 : 2,
        name: productName,
      },
    ],
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/">Home</Link>} />
          </BreadcrumbItem>
          {category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  render={
                    <Link href={categoryHref(category.id, category.slug)}>
                      {category.name || ""}
                    </Link>
                  }
                />
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1">{productName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery images={images} alt={productName} />

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {productName}
            </h1>
            {business.reviewsEnabled && product.reviewCount > 0 && (
              <a href="#reviews" className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                <span className="font-semibold text-foreground">{product.averageRating.toFixed(1)}</span>
                {t("reviewCountShort", { count: product.reviewCount })}
              </a>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <ProductPurchasePanel product={product} currency={currency} locale={locale} />

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {business.deliveryModuleEnabled ? (
              <Truck className="size-3.5 shrink-0" />
            ) : (
              <Store className="size-3.5 shrink-0" />
            )}
            {business.deliveryModuleEnabled ? t("shareTrust") : t("shareTrustPickup")}
          </p>

          {product.description && (
            <div className="border-t border-border pt-4">
              <h2 className="mb-2 text-sm font-semibold text-foreground">{t("description")}</h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          {product.sku && (
            <p className="text-xs text-muted-foreground">
              {t("sku")}: {product.sku}
            </p>
          )}
        </div>
      </div>

      {alsoBought.length > 0 && (
        <RecommendedProducts
          title={t("alsoBought")}
          products={alsoBought}
          currency={currency}
          locale={locale}
        />
      )}

      {related.length > 0 && (
        <RecommendedProducts
          title={t("relatedProducts")}
          products={related}
          currency={currency}
          locale={locale}
        />
      )}

      {business.reviewsEnabled && reviewSummary && reviews && (
        <ReviewsSection
          productId={product.id}
          summary={reviewSummary}
          reviews={reviews}
          locale={locale}
        />
      )}
    </div>
  );
}
