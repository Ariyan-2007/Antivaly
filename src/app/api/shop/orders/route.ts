import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/api/proxy";

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.search;
  return proxyAuthed({ method: "GET", upstreamPath: `/api/shop/orders${qs}` });
}
