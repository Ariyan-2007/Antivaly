import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/api/proxy";
import { safeJsonBody, badRequest } from "@/lib/api/route-helpers";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const body = await safeJsonBody(request);
  if (!body) return badRequest();
  return proxyAuthed({
    method: "PUT",
    upstreamPath: `/api/shop/cart/items/${productId}`,
    body,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  return proxyAuthed({ method: "DELETE", upstreamPath: `/api/shop/cart/items/${productId}` });
}
