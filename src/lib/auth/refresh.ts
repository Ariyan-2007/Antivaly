import { API_BASE_URL } from "@/lib/constants";
import type { AuthResponse } from "@/types/api";

/**
 * Calls Vastora's refresh endpoint directly. Used by middleware (edge, runs on every
 * request) and the auth proxy — must never throw, since middleware has no error boundary
 * to catch it and a throw there would take down every page load.
 */
export async function refreshTokens(refreshToken: string): Promise<AuthResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as AuthResponse;
  } catch {
    return null;
  }
}
