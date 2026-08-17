import { NextRequest } from "next/server";
import { proxyPublic } from "@/lib/api/proxy";
import { safeJsonBody, badRequest } from "@/lib/api/route-helpers";

export async function POST(request: NextRequest) {
  const body = await safeJsonBody(request);
  if (!body) return badRequest();
  return proxyPublic({ method: "POST", upstreamPath: "/api/auth/verify-email", body });
}
