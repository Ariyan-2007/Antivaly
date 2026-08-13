import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/constants";
import { REFRESH_COOKIE, AUTH_COOKIE_NAMES } from "@/lib/auth/cookies";

export async function POST() {
  try {
    const store = await cookies();
    const refreshToken = store.get(REFRESH_COOKIE)?.value;

    if (refreshToken) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      }).catch(() => {});
    }
  } catch {
    // Even if reading cookies somehow fails, still clear them on the response below —
    // logging out must always succeed from the client's perspective.
  }

  const res = NextResponse.json({ ok: true });
  for (const name of AUTH_COOKIE_NAMES) res.cookies.delete(name);
  return res;
}
