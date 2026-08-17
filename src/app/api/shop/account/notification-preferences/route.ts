import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/api/proxy";
import { safeJsonBody, badRequest } from "@/lib/api/route-helpers";

// No GET exists for this resource on the Vastora API (blueprint §6.5 lists PUT only) — the
// form caches the last-saved values client-side instead of round-tripping through here.
export async function PUT(request: NextRequest) {
  const body = await safeJsonBody(request);
  if (!body) return badRequest();
  return proxyAuthed({ method: "PUT", upstreamPath: "/api/shop/account/notification-preferences", body });
}
