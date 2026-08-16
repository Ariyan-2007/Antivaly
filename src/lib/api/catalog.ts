import { apiFetch, ApiError } from "@/lib/api/client";
import { BUSINESS_SLUG } from "@/lib/constants";
import type {
  BusinessResponse,
  CategoryResponse,
  ProductResponse,
  PagedResult,
  CatalogFacetsResponse,
  CatalogSort,
  ReviewResponse,
  ReviewSummaryResponse,
  RecommendedProductResponse,
  ContentBlockResponse,
  MenuNode,
} from "@/types/api";

const REVALIDATE_SECONDS = 60;

export async function getBusiness(): Promise<BusinessResponse> {
  const data = await apiFetch<BusinessResponse>(`/api/shop/${BUSINESS_SLUG}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  // A 200 response with an unexpected shape (e.g. `null`) would otherwise crash every
  // `business.*` access downstream — surface it as the same "unavailable" path instead.
  if (!data || typeof data !== "object" || !("id" in data)) {
    throw new ApiError({ status: 502, title: "Received an unexpected response from the server." });
  }
  return data;
}

export async function getCategories(): Promise<CategoryResponse[]> {
  const data = await apiFetch<CategoryResponse[]>(`/api/shop/${BUSINESS_SLUG}/categories`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  // Defensive: guard against an unexpected non-array response shape rather than letting
  // every `.map`/`.filter` call site downstream crash.
  return Array.isArray(data) ? data : [];
}

export type CatalogQuery = {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  tags?: string[];
  inStockOnly?: boolean;
  minRating?: number;
  featuredOnly?: boolean;
  sort?: CatalogSort;
  page?: number;
  pageSize?: number;
};

function buildCatalogQuery(params?: CatalogQuery): string {
  const query = new URLSearchParams();
  if (params?.categoryId) query.set("categoryId", params.categoryId);
  if (params?.search) query.set("search", params.search);
  if (params?.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params?.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params?.brand) query.set("brand", params.brand);
  for (const tag of params?.tags ?? []) query.append("tags", tag);
  if (params?.inStockOnly) query.set("inStockOnly", "true");
  if (params?.minRating !== undefined) query.set("minRating", String(params.minRating));
  if (params?.featuredOnly) query.set("featuredOnly", "true");
  if (params?.sort) query.set("sort", params.sort);
  if (params?.page !== undefined) query.set("page", String(params.page));
  if (params?.pageSize !== undefined) query.set("pageSize", String(params.pageSize));
  return query.toString();
}

const emptyPage = <T>(): PagedResult<T> => ({
  items: [],
  page: 1,
  pageSize: 0,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
});

export async function getProducts(params?: CatalogQuery): Promise<PagedResult<ProductResponse>> {
  const qs = buildCatalogQuery(params);
  const data = await apiFetch<PagedResult<ProductResponse>>(
    `/api/shop/${BUSINESS_SLUG}/products${qs ? `?${qs}` : ""}`,
    { next: { revalidate: REVALIDATE_SECONDS } }
  );
  return data && Array.isArray(data.items) ? data : emptyPage<ProductResponse>();
}

export async function getProductFacets(params?: CatalogQuery): Promise<CatalogFacetsResponse> {
  const qs = buildCatalogQuery(params);
  const data = await apiFetch<CatalogFacetsResponse>(
    `/api/shop/${BUSINESS_SLUG}/products/facets${qs ? `?${qs}` : ""}`,
    { next: { revalidate: REVALIDATE_SECONDS } }
  );
  return (
    data ?? {
      categories: [],
      brands: [],
      tags: [],
      minPrice: 0,
      maxPrice: 0,
      inStockCount: 0,
      totalCount: 0,
    }
  );
}

export async function getProduct(productId: string): Promise<ProductResponse | null> {
  try {
    return await apiFetch<ProductResponse>(
      `/api/shop/${BUSINESS_SLUG}/products/${productId}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function getProductReviews(
  productId: string,
  params?: { page?: number; pageSize?: number }
): Promise<PagedResult<ReviewResponse>> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set("page", String(params.page));
  if (params?.pageSize !== undefined) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  const data = await apiFetch<PagedResult<ReviewResponse>>(
    `/api/shop/${BUSINESS_SLUG}/products/${productId}/reviews${qs ? `?${qs}` : ""}`,
    { next: { revalidate: REVALIDATE_SECONDS } }
  );
  return data && Array.isArray(data.items) ? data : emptyPage<ReviewResponse>();
}

export async function getReviewSummary(productId: string): Promise<ReviewSummaryResponse> {
  const data = await apiFetch<ReviewSummaryResponse>(
    `/api/shop/${BUSINESS_SLUG}/products/${productId}/reviews/summary`,
    { next: { revalidate: REVALIDATE_SECONDS } }
  );
  return (
    data ?? {
      productId,
      averageRating: 0,
      reviewCount: 0,
      ratingCounts: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    }
  );
}

export async function getAlsoBought(productId: string): Promise<RecommendedProductResponse[]> {
  const data = await apiFetch<RecommendedProductResponse[]>(
    `/api/shop/${BUSINESS_SLUG}/products/${productId}/also-bought`,
    { next: { revalidate: REVALIDATE_SECONDS } }
  );
  return Array.isArray(data) ? data : [];
}

export async function getRelated(productId: string): Promise<RecommendedProductResponse[]> {
  const data = await apiFetch<RecommendedProductResponse[]>(
    `/api/shop/${BUSINESS_SLUG}/products/${productId}/related`,
    { next: { revalidate: REVALIDATE_SECONDS } }
  );
  return Array.isArray(data) ? data : [];
}

export async function getBanners(): Promise<ContentBlockResponse[]> {
  const data = await apiFetch<ContentBlockResponse[]>(`/api/shop/${BUSINESS_SLUG}/banners`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  return Array.isArray(data) ? data : [];
}

export async function getMenu(): Promise<MenuNode[]> {
  const data = await apiFetch<MenuNode[]>(`/api/shop/${BUSINESS_SLUG}/menu`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  return Array.isArray(data) ? data : [];
}

export async function getPages(): Promise<ContentBlockResponse[]> {
  const data = await apiFetch<ContentBlockResponse[]>(`/api/shop/${BUSINESS_SLUG}/pages`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  return Array.isArray(data) ? data : [];
}

export async function getPage(pageSlug: string): Promise<ContentBlockResponse | null> {
  try {
    return await apiFetch<ContentBlockResponse>(
      `/api/shop/${BUSINESS_SLUG}/pages/${pageSlug}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
