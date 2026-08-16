import { proxyAuthed } from "@/lib/api/proxy";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ returnId: string }> }
) {
  const { returnId } = await params;
  return proxyAuthed({
    method: "POST",
    upstreamPath: `/api/shop/orders/returns/${returnId}/cancel`,
  });
}
