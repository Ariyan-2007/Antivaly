import { apiFetch, ApiError } from "@/lib/api/client";
import { BUSINESS_SLUG } from "@/lib/constants";
import type { BusinessResponse, CategoryResponse, ProductResponse } from "@/types/api";

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

export async function getProducts(params?: {
  categoryId?: string;
  search?: string;
}): Promise<ProductResponse[]> {
  const query = new URLSearchParams();
  if (params?.categoryId) query.set("categoryId", params.categoryId);
  if (params?.search) query.set("search", params.search);
  const qs = query.toString();

  const data = await apiFetch<ProductResponse[]>(
    `/api/shop/${BUSINESS_SLUG}/products${qs ? `?${qs}` : ""}`,
    { next: { revalidate: REVALIDATE_SECONDS } }
  );
  return Array.isArray(data) ? data : [];
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
