import { NextRequest } from "next/server";
import { proxyCartOrCheckout } from "@/lib/api/proxy";
import { safeJsonBody, badRequest } from "@/lib/api/route-helpers";
import { getBusiness } from "@/lib/api/catalog";
import { CART_TOKEN_HEADER } from "@/lib/cart/guest-token";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const body = await safeJsonBody(request);
  if (!body) return badRequest();
  const business = await getBusiness();
  return proxyCartOrCheckout({
    method: "PUT",
    upstreamPath: `/api/shop/cart/items/${productId}?businessId=${business.id}`,
    body,
    guestToken: request.headers.get(CART_TOKEN_HEADER),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const business = await getBusiness();
  const variantId = request.nextUrl.searchParams.get("variantId");
  const query = new URLSearchParams({ businessId: business.id });
  if (variantId) query.set("variantId", variantId);
  return proxyCartOrCheckout({
    method: "DELETE",
    upstreamPath: `/api/shop/cart/items/${productId}?${query.toString()}`,
    guestToken: request.headers.get(CART_TOKEN_HEADER),
  });
}
