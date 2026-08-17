import { NextRequest } from "next/server";
import { proxyPublic } from "@/lib/api/proxy";
import { getBusiness } from "@/lib/api/catalog";

export async function GET(request: NextRequest) {
  const business = await getBusiness();
  const orderNumber = request.nextUrl.searchParams.get("orderNumber") ?? "";
  const email = request.nextUrl.searchParams.get("email") ?? "";
  const query = new URLSearchParams({ businessId: business.id, orderNumber, email });
  return proxyPublic({
    method: "GET",
    upstreamPath: `/api/shop/orders/lookup?${query.toString()}`,
  });
}
