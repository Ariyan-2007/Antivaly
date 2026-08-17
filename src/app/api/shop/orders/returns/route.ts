import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/api/proxy";
import { safeJsonBody, badRequest } from "@/lib/api/route-helpers";

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.search;
  return proxyAuthed({ method: "GET", upstreamPath: `/api/shop/orders/returns${qs}` });
}

export async function POST(request: NextRequest) {
  const body = await safeJsonBody(request);
  if (!body) return badRequest();
  return proxyAuthed({ method: "POST", upstreamPath: "/api/shop/orders/returns", body });
}
