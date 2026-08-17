import { getTranslations } from "next-intl/server";
import { CategoryChips } from "@/components/shop/category-chips";
import { ProductGrid } from "@/components/shop/product-grid";
import { FacetSidebar } from "@/components/shop/facet-sidebar";
import { SortDropdown } from "@/components/shop/sort-dropdown";
import { PaginationControls } from "@/components/shop/pagination-controls";
import { getTopLevelCategories, getChildCategories } from "@/lib/shop/category-tree";
import type { CategoryResponse, PagedResult, ProductResponse, CatalogFacetsResponse, CatalogSort } from "@/types/api";

export async function ProductListing({
  title,
  page,
  facets,
  sort,
  categories,
  activeCategory,
  currency,
  locale,
  breadcrumb,
}: {
  title: string;
  page: PagedResult<ProductResponse>;
  facets: CatalogFacetsResponse;
  sort: CatalogSort;
  /** Full flat list (parents + children) — used to derive both the top-level nav row and any
   * subcategory row below it. */
  categories: CategoryResponse[];
  activeCategory?: CategoryResponse | null;
  currency: string;
  locale: string;
  breadcrumb?: React.ReactNode;
}) {
  const t = await getTranslations("listing");
  const activeCategoryId = activeCategory?.id;
  const children = activeCategory ? getChildCategories(categories, activeCategory.id) : [];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6">
      {breadcrumb}

      <CategoryChips categories={getTopLevelCategories(categories)} activeCategoryId={activeCategoryId} />

      {children.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">{t("subcategories")}</span>
          <CategoryChips categories={children} showAllChip={false} size="sm" />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {t("resultsCount", { count: page.totalCount })}
          </span>
          <SortDropdown value={sort} />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <FacetSidebar facets={facets} categories={categories} showCategoryFilter={!activeCategory} />

        <div className="flex flex-1 flex-col gap-6">
          <ProductGrid
            products={page.items}
            currency={currency}
            locale={locale}
            emptyMessage={t("noResults")}
          />
          <PaginationControls
            page={page.page}
            totalPages={page.totalPages}
            hasNextPage={page.hasNextPage}
            hasPreviousPage={page.hasPreviousPage}
          />
        </div>
      </div>
    </div>
  );
}
