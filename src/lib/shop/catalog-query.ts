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
