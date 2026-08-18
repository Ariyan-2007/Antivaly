import { NextRequest } from "next/server";
import { proxyCartOrCheckout } from "@/lib/api/proxy";
import { safeJsonBody, badRequest } from "@/lib/api/route-helpers";
import { getBusiness } from "@/lib/api/catalog";
import { CART_TOKEN_HEADER } from "@/lib/cart/guest-token";

/** Guest and Customer (blueprint §6.3/§9.44) — preview-only, so both identities can set it
 * before there's ever an account. */
export async function PUT(request: NextRequest) {
  const body = await safeJsonBody(request);
  if (!body) return badRequest();
  const business = await getBusiness();
  return proxyCartOrCheckout({
    method: "PUT",
    upstreamPath: `/api/shop/cart/fulfillment-method?businessId=${business.id}`,
    body,
    guestToken: request.headers.get(CART_TOKEN_HEADER),
  });
}
