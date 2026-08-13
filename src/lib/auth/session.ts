import "server-only";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api/client";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import type { UserSummaryResponse } from "@/types/api";

/**
 * Reads the current customer session for Server Components that need to gate a page
 * (cart/checkout/orders/account). Relies on proxy.ts having already refreshed an
 * expired access token before render (see src/proxy.ts) — Server Components can't
 * set cookies themselves, so no refresh-retry happens here.
 *
 * Treats ANY failure (not just "not authenticated") as no-session. If the API is briefly
 * unreachable, the gated pages fall back to their "sign in to continue" UI rather than
 * crashing — a safe degradation, since there is no session data to show either way.
 */
export async function getServerSession(): Promise<UserSummaryResponse | null> {
  try {
    const store = await cookies();
    const accessToken = store.get(ACCESS_COOKIE)?.value;
    if (!accessToken) return null;

    return await apiFetch<UserSummaryResponse>("/api/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    return null;
  }
}
