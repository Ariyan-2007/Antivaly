import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/api/proxy";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  return proxyAuthed({ method: "GET", upstreamPath: `/api/shop/orders/${orderId}` });
}
