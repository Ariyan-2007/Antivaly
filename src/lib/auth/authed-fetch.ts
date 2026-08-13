import "server-only";
import { cookies } from "next/headers";
import { apiFetch, ApiError } from "@/lib/api/client";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

export type AuthedFetchResult<T> =
  | { data: T; error: null }
  | { data: null; error: "unauthorized" | "unavailable" };

/**
 * For Server Components that render authed data (orders list/detail) after the page has
 * already gated on getServerSession(). Never throws — every failure resolves to a typed
 * `error` field so pages can show "you have none yet" vs. "couldn't load, try again" instead
 * of silently mislabeling a real failure as an empty state, while still never crashing.
 */
export async function serverAuthedFetch<T>(path: string): Promise<AuthedFetchResult<T>> {
  try {
    const store = await cookies();
    const accessToken = store.get(ACCESS_COOKIE)?.value;
    if (!accessToken) return { data: null, error: "unauthorized" };

    const data = await apiFetch<T>(path, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    return { data, error: null };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return { data: null, error: "unauthorized" };
    return { data: null, error: "unavailable" };
  }
}
