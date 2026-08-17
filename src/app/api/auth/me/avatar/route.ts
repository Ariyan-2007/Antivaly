import { NextRequest } from "next/server";
import { proxyAuthed, proxyAuthedMultipart } from "@/lib/api/proxy";
import { badRequest } from "@/lib/api/route-helpers";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return badRequest();
  }
  if (!(formData.get("file") instanceof File)) return badRequest("Missing file.");
  return proxyAuthedMultipart({ method: "POST", upstreamPath: "/api/auth/me/avatar", formData });
}

export async function DELETE() {
  return proxyAuthed({ method: "DELETE", upstreamPath: "/api/auth/me/avatar" });
}
