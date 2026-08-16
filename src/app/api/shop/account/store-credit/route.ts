import { proxyAuthed } from "@/lib/api/proxy";

export async function GET() {
  return proxyAuthed({ method: "GET", upstreamPath: "/api/shop/account/store-credit" });
}
