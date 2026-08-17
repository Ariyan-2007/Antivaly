import type { CatalogQuery } from "@/lib/api/catalog";
import type { CatalogSort } from "@/types/api";

const VALID_SORTS: CatalogSort[] = [
  "Relevance",
  "Newest",
  "PriceAscending",
  "PriceDescending",
  "TopRated",
  "BestSelling",
  "NameAscending",
];

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/** Facet keys that meaningfully narrow the result set (as opposed to `sort`, which just
 * reorders it, or `page` — checked separately since only page > 1 counts). A listing URL
 * carrying any of these is a thin/duplicate variant of the base listing for SEO purposes. */
const FILTER_KEYS = ["minPrice", "maxPrice", "brand", "tags", "inStockOnly", "minRating", "featuredOnly"];

/** True when the URL represents a narrowed/paginated view rather than the clean base
 * listing — used by both listing pages' `generateMetadata` to noindex (but still follow)
 * thin facet-combination pages while keeping the canonical listing indexable. */
export function isFilteredView(searchParams: RawSearchParams): boolean {
  const page = first(searchParams.page);
  return FILTER_KEYS.some((key) => Boolean(first(searchParams[key]))) || Boolean(page && page !== "1");
}

/** Parses a Next.js `searchParams` object into the §6.2 catalog query — shared by the "all
 * products" page and every category page so filter URLs behave identically on both. */
export function parseCatalogSearchParams(searchParams: RawSearchParams): CatalogQuery {
  const sortRaw = first(searchParams.sort);
  const sort = VALID_SORTS.includes(sortRaw as CatalogSort) ? (sortRaw as CatalogSort) : "Relevance";

  const tagsRaw = searchParams.tags;
  const tags = Array.isArray(tagsRaw) ? tagsRaw : tagsRaw ? [tagsRaw] : undefined;

  return {
    search: first(searchParams.q) || first(searchParams.search) || undefined,
    minPrice: toNumber(first(searchParams.minPrice)),
    maxPrice: toNumber(first(searchParams.maxPrice)),
    brand: first(searchParams.brand) || undefined,
    tags,
    inStockOnly: first(searchParams.inStockOnly) === "true",
    minRating: toNumber(first(searchParams.minRating)),
    featuredOnly: first(searchParams.featuredOnly) === "true",
    sort,
    page: toNumber(first(searchParams.page)) ?? 1,
    pageSize: 24,
  };
}
