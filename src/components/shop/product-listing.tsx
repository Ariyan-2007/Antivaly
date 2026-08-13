import { getTranslations } from "next-intl/server";
import { CategoryChips } from "@/components/shop/category-chips";
import { ProductGrid } from "@/components/shop/product-grid";
import type { CategoryResponse, ProductResponse } from "@/types/api";

export async function ProductListing({
  title,
  products,
  categories,
  activeCategoryId,
  currency,
  locale,
}: {
  title: string;
  products: ProductResponse[];
  categories: CategoryResponse[];
  activeCategoryId?: string;
  currency: string;
  locale: string;
}) {
  const t = await getTranslations("listing");

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6">
      <CategoryChips categories={categories} activeCategoryId={activeCategoryId} />

      <div className="flex items-baseline justify-between">
        <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
        <span className="text-sm text-muted-foreground">
          {t("resultsCount", { count: products.length })}
        </span>
      </div>

      <ProductGrid
        products={products}
        currency={currency}
        locale={locale}
        emptyMessage={t("noResults")}
      />
    </div>
  );
}
