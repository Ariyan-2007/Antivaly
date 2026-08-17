import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/api/proxy";
import { safeJsonBody, badRequest } from "@/lib/api/route-helpers";
import type { ChangePasswordRequest } from "@/types/api";

export async function POST(request: NextRequest) {
  const body = await safeJsonBody<ChangePasswordRequest>(request);
  if (!body) return badRequest();
  return proxyAuthed({ method: "POST", upstreamPath: "/api/auth/me/change-password", body });
}
