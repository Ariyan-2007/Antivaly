import { proxyAuthed } from "@/lib/api/proxy";

export async function GET() {
  return proxyAuthed({ method: "GET", upstreamPath: "/api/shop/cart" });
}

export async function DELETE() {
  return proxyAuthed({ method: "DELETE", upstreamPath: "/api/shop/cart" });
}
