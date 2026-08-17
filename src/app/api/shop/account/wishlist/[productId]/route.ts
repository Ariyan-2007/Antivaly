import { proxyAuthed } from "@/lib/api/proxy";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  return proxyAuthed({ method: "POST", upstreamPath: `/api/shop/account/wishlist/${productId}` });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  return proxyAuthed({ method: "DELETE", upstreamPath: `/api/shop/account/wishlist/${productId}` });
}
