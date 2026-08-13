import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/client";
import { BUSINESS_SLUG } from "@/lib/constants";
import { buildAuthCookies } from "@/lib/auth/cookies";
import { safeJsonBody, badRequest, apiErrorResponse } from "@/lib/api/route-helpers";
import type { AuthResponse, StorefrontLoginRequest } from "@/types/api";

export async function POST(request: NextRequest) {
  const body = await safeJsonBody<StorefrontLoginRequest>(request);
  if (!body) return badRequest();

  try {
    const auth = await apiFetch<AuthResponse>(`/api/shop/${BUSINESS_SLUG}/auth/login`, {
      method: "POST",
      body,
    });

    const res = NextResponse.json(auth.user);
    for (const cookie of buildAuthCookies(auth)) {
      res.cookies.set(cookie.name, cookie.value, cookie.options);
    }
    return res;
  } catch (err) {
    return apiErrorResponse(err);
  }
}
