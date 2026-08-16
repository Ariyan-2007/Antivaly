import { NextRequest } from "next/server";
import { proxyCartOrCheckout } from "@/lib/api/proxy";
import { safeJsonBody, badRequest } from "@/lib/api/route-helpers";
import { getBusiness } from "@/lib/api/catalog";
import { CART_TOKEN_HEADER } from "@/lib/cart/guest-token";

export async function POST(request: NextRequest) {
  const body = await safeJsonBody(request);
  if (!body) return badRequest();
  const business = await getBusiness();
  const idempotencyKey = request.headers.get("Idempotency-Key");
  return proxyCartOrCheckout({
    method: "POST",
    upstreamPath: `/api/shop/orders/checkout?businessId=${business.id}&tenantId=${business.tenantId}`,
    body,
    guestToken: request.headers.get(CART_TOKEN_HEADER),
    extraHeaders: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
  });
}
