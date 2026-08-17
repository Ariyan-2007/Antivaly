import { proxyAuthed } from "@/lib/api/proxy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  return proxyAuthed({ method: "GET", upstreamPath: `/api/shop/account/gift-cards/${code}` });
}
