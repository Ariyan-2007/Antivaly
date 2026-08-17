import { getProducts, getProductFacets, type CatalogQuery } from "@/lib/api/catalog";
import { getChildCategories } from "@/lib/shop/category-tree";
import type {
  CategoryResponse,
  CatalogFacetsResponse,
  CatalogSort,
  PagedResult,
  ProductResponse,
} from "@/types/api";

/** Cap on how many products per subtree member we pull in before merging — generous enough
 * for a single-business catalog without fetching unbounded result sets. */
const MERGE_FETCH_SIZE = 200;

function sortMerged(products: ProductResponse[], sort: CatalogSort): ProductResponse[] {
  const sorted = [...products];
  switch (sort) {
    case "Newest":
      sorted.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
      break;
    case "PriceAscending":
      sorted.sort((a, b) => a.effectivePrice - b.effectivePrice);
      break;
    case "PriceDescending":
      sorted.sort((a, b) => b.effectivePrice - a.effectivePrice);
      break;
    case "TopRated":
      sorted.sort((a, b) => b.averageRating - a.averageRating);
      break;
    case "NameAscending":
      sorted.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
      break;
    // "BestSelling" has no client-visible sales metric to sort by — fall back to the same
    // featured/merchandising order as Relevance rather than leaving the merged list unsorted.
    case "BestSelling":
    case "Relevance":
    default:
      sorted.sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        if (b.sortWeight !== a.sortWeight) return b.sortWeight - a.sortWeight;
        return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
      });
      break;
  }
  return sorted;
}

function mergeFacets(pages: CatalogFacetsResponse[]): CatalogFacetsResponse {
  const brandCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  let minPrice = Infinity;
  let maxPrice = 0;
  let inStockCount = 0;

  for (const f of pages) {
    for (const b of f.brands) brandCounts.set(b.value, (brandCounts.get(b.value) ?? 0) + b.count);
    for (const t of f.tags) tagCounts.set(t.value, (tagCounts.get(t.value) ?? 0) + t.count);
    for (const c of f.categories) categoryCounts.set(c.value, (categoryCounts.get(c.value) ?? 0) + c.count);
    if (f.totalCount > 0) {
      minPrice = Math.min(minPrice, f.minPrice);
      maxPrice = Math.max(maxPrice, f.maxPrice);
    }
    inStockCount += f.inStockCount;
  }

  return {
    categories: [...categoryCounts.entries()].map(([value, count]) => ({ value, count })),
    brands: [...brandCounts.entries()].map(([value, count]) => ({ value, count })),
    tags: [...tagCounts.entries()].map(([value, count]) => ({ value, count })),
    minPrice: Number.isFinite(minPrice) ? minPrice : 0,
    maxPrice,
    inStockCount,
    // Recomputed from the deduped merged product list by the caller, not summed here — summing
    // per-source totalCount would double-count any product a source already shares with another.
    totalCount: 0,
  };
}

/**
 * A parent category's own `categoryId` filter isn't guaranteed to already include its
 * children's products (that's an internal backend implementation detail, not part of the
 * documented contract) — so for any category with subcategories, fetch every id in the
 * one-level-deep subtree explicitly and merge/dedupe/re-sort/re-paginate client-side. This
 * makes "click Electronics, see every Laptop and Phone product too" correct regardless of
 * whether the backend already does that expansion on its own.
 */
export async function getCategoryTreeListing(
  categories: CategoryResponse[],
  category: CategoryResponse,
  query: CatalogQuery
): Promise<{ page: PagedResult<ProductResponse>; facets: CatalogFacetsResponse }> {
  const children = getChildCategories(categories, category.id);

  if (children.length === 0) {
    const [page, facets] = await Promise.all([
      getProducts({ ...query, categoryId: category.id }),
      getProductFacets({ ...query, categoryId: category.id }),
    ]);
    return { page, facets };
  }

  const ids = [category.id, ...children.map((c) => c.id)];
  const [productPages, facetPages] = await Promise.all([
    Promise.all(
      ids.map((id) => getProducts({ ...query, categoryId: id, page: 1, pageSize: MERGE_FETCH_SIZE }))
    ),
    Promise.all(ids.map((id) => getProductFacets({ ...query, categoryId: id }))),
  ]);

  const seen = new Set<string>();
  const merged: ProductResponse[] = [];
  for (const p of productPages) {
    for (const item of p.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
  }

  const sort = query.sort ?? "Relevance";
  const sorted = sortMerged(merged, sort);
  const pageSize = query.pageSize ?? 24;
  const pageNum = query.page ?? 1;
  const start = (pageNum - 1) * pageSize;
  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    page: {
      items: sorted.slice(start, start + pageSize),
      page: pageNum,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    },
    facets: { ...mergeFacets(facetPages), totalCount },
  };
}
