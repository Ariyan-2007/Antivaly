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
import { Price } from "@/components/shop/price";
import { StockBadge } from "@/components/shop/stock-badge";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { ProductGrid } from "@/components/shop/product-grid";
import { Badge } from "@/components/ui/badge";
import { getBusiness, getCategories, getProduct, getProducts } from "@/lib/api/catalog";
import { categoryHref } from "@/lib/routes";
import { DEFAULT_CURRENCY } from "@/lib/constants";

type Props = {
  params: Promise<{ locale: string; id: string; slug: string }>;
};

export async function generateStaticParams() {
  // Falls back to on-demand rendering (dynamicParams) if the API is unreachable at build
  // time — a prebuild-time outage shouldn't fail the whole build.
  try {
    const products = await getProducts();
    return products.map((p) => ({ id: p.id, slug: p.slug || p.id }));
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
    title: product.name || undefined,
    description: product.description || product.name || undefined,
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
  const relatedProducts = product.categoryId
    ? (await getProducts({ categoryId: product.categoryId }).catch(() => [])).filter(
        (p) => p.id !== product.id
      )
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description: product.description || undefined,
    sku: product.sku || undefined,
    image: images,
    offers: {
      "@type": "Offer",
      priceCurrency: currency,
      price: product.effectivePrice,
      availability:
        product.trackInventory && product.stockQuantity <= 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
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

  const isOutOfStock = product.trackInventory && product.stockQuantity <= 0;

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
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {productName}
          </h1>

          <Price
            effectivePrice={product.effectivePrice}
            compareAtPrice={product.compareAtPrice}
            discountPercent={product.discountPercent}
            currency={currency}
            locale={locale}
            size="lg"
          />

          <StockBadge stockQuantity={product.stockQuantity} trackInventory={product.trackInventory} />

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="border-t border-border pt-4">
            <AddToCartButton productId={product.id} disabled={isOutOfStock} />
          </div>

          <p className="text-xs text-muted-foreground">{t("shareTrust")}</p>

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

      {relatedProducts.length > 0 && (
        <section className="flex flex-col gap-4 border-t border-border pt-8">
          <h2 className="font-heading text-xl font-bold text-foreground">
            {t("relatedProducts")}
          </h2>
          <ProductGrid products={relatedProducts.slice(0, 6)} currency={currency} locale={locale} />
        </section>
      )}
    </div>
  );
}
