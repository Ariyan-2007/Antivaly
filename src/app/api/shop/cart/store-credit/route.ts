import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/api/proxy";
import { safeJsonBody, badRequest } from "@/lib/api/route-helpers";

/** Customer only (blueprint §6.3/§9.43) — a guest has no account and therefore no store-credit
 * balance to opt into. */
export async function PUT(request: NextRequest) {
  const body = await safeJsonBody(request);
  if (!body) return badRequest();
  return proxyAuthed({
    method: "PUT",
    upstreamPath: "/api/shop/cart/store-credit",
    body,
  });
}
