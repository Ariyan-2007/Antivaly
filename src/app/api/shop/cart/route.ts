import { NextRequest } from "next/server";
import { proxyCartOrCheckout } from "@/lib/api/proxy";
import { getBusiness } from "@/lib/api/catalog";
import { CART_TOKEN_HEADER } from "@/lib/cart/guest-token";

export async function GET(request: NextRequest) {
  const business = await getBusiness();
  return proxyCartOrCheckout({
    method: "GET",
    upstreamPath: `/api/shop/cart?businessId=${business.id}`,
    guestToken: request.headers.get(CART_TOKEN_HEADER),
  });
}

export async function DELETE(request: NextRequest) {
  const business = await getBusiness();
  return proxyCartOrCheckout({
    method: "DELETE",
    upstreamPath: `/api/shop/cart?businessId=${business.id}`,
    guestToken: request.headers.get(CART_TOKEN_HEADER),
  });
}
