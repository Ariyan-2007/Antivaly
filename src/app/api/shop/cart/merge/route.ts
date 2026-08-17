import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/api/proxy";

export async function POST(request: NextRequest) {
  const guestToken = request.nextUrl.searchParams.get("guestToken");
  return proxyAuthed({
    method: "POST",
    upstreamPath: `/api/shop/cart/merge?guestToken=${encodeURIComponent(guestToken ?? "")}`,
  });
}
