import { NextRequest } from "next/server";
import { proxyCartOrCheckout } from "@/lib/api/proxy";
import { getBusiness } from "@/lib/api/catalog";
import { CART_TOKEN_HEADER } from "@/lib/cart/guest-token";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const business = await getBusiness();
  return proxyCartOrCheckout({
    method: "DELETE",
    upstreamPath: `/api/shop/cart/gift-cards/${code}?businessId=${business.id}`,
    guestToken: request.headers.get(CART_TOKEN_HEADER),
  });
}
