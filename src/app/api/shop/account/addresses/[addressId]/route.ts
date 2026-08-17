import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/api/proxy";
import { safeJsonBody, badRequest } from "@/lib/api/route-helpers";
import type { SaveAddressRequest } from "@/types/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  const { addressId } = await params;
  const body = await safeJsonBody<SaveAddressRequest>(request);
  if (!body) return badRequest();
  return proxyAuthed({
    method: "PUT",
    upstreamPath: `/api/shop/account/addresses/${addressId}`,
    body,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  const { addressId } = await params;
  return proxyAuthed({ method: "DELETE", upstreamPath: `/api/shop/account/addresses/${addressId}` });
}
