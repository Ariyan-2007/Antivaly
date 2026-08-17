import { apiFetch, ApiError } from "@/lib/api/client";

/** Public, non-enumerating (blueprint §6.1/§9.36) — always resolves regardless of whether
 * the token is valid, so the landing page always shows the same confirmation. */
export async function unsubscribe(token: string): Promise<void> {
  try {
    await apiFetch<void>(`/api/auth/unsubscribe/${encodeURIComponent(token)}`, {
      method: "POST",
      cache: "no-store",
    });
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
  }
}
