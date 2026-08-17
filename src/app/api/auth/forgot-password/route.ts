import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/client";
import { BUSINESS_SLUG } from "@/lib/constants";
import { safeJsonBody, badRequest, apiErrorResponse } from "@/lib/api/route-helpers";

export async function POST(request: NextRequest) {
  const body = await safeJsonBody<{ email: string }>(request);
  if (!body) return badRequest();

  try {
    await apiFetch<void>(`/api/shop/${BUSINESS_SLUG}/auth/forgot-password`, {
      method: "POST",
      body,
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
