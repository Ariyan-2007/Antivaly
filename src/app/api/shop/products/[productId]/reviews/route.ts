import { NextRequest } from "next/server";
import { proxyPublic } from "@/lib/api/proxy";
import { BUSINESS_SLUG } from "@/lib/constants";

/** Client-driven review pagination (no page navigation) — keeps the product detail page
 * static/ISR instead of forcing dynamic rendering just to paginate reviews. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const qs = request.nextUrl.search;
  return proxyPublic({
    method: "GET",
    upstreamPath: `/api/shop/${BUSINESS_SLUG}/products/${productId}/reviews${qs}`,
  });
}
