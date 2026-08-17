import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/client";
import { safeJsonBody, badRequest, apiErrorResponse } from "@/lib/api/route-helpers";

export async function POST(request: NextRequest) {
  const body = await safeJsonBody<{ token: string; newPassword: string }>(request);
  if (!body) return badRequest();

  try {
    await apiFetch<void>("/api/auth/reset-password", {
      method: "POST",
      body,
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
