import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/api/proxy";
import { safeJsonBody, badRequest } from "@/lib/api/route-helpers";
import type { SaveAddressRequest } from "@/types/api";

export async function GET() {
  return proxyAuthed({ method: "GET", upstreamPath: "/api/shop/account/addresses" });
}

export async function POST(request: NextRequest) {
  const body = await safeJsonBody<SaveAddressRequest>(request);
  if (!body) return badRequest();
  return proxyAuthed({ method: "POST", upstreamPath: "/api/shop/account/addresses", body });
}
