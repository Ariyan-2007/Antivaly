import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/api/proxy";
import { safeJsonBody, badRequest } from "@/lib/api/route-helpers";

export async function GET() {
  return proxyAuthed({ method: "GET", upstreamPath: "/api/auth/me" });
}

export async function PUT(request: NextRequest) {
  const body = await safeJsonBody(request);
  if (!body) return badRequest();
  return proxyAuthed({ method: "PUT", upstreamPath: "/api/auth/me", body });
}
