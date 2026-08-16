import { apiFetch, ApiError } from "@/lib/api/client";
import { getBusiness } from "@/lib/api/catalog";
import type { OrderResponse } from "@/types/api";

/** Public, guest order tracking (blueprint §6.4) — no auth, business-scoped by id. */
export async function lookupOrder(orderNumber: string, email: string): Promise<OrderResponse | null> {
  try {
    const business = await getBusiness();
    const query = new URLSearchParams({ businessId: business.id, orderNumber, email });
    return await apiFetch<OrderResponse>(`/api/shop/orders/lookup?${query.toString()}`, {
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) return null;
    throw err;
  }
}
