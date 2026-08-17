import { proxyPublic } from "@/lib/api/proxy";
import { BUSINESS_SLUG } from "@/lib/constants";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const { reviewId } = await params;
  return proxyPublic({
    method: "POST",
    upstreamPath: `/api/shop/${BUSINESS_SLUG}/reviews/${reviewId}/helpful`,
  });
}
