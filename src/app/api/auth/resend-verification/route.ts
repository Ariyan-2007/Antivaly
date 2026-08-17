import { proxyAuthed } from "@/lib/api/proxy";

// Idempotent even if the account is already verified (blueprint §6.1) — no body needed.
export async function POST() {
  return proxyAuthed({ method: "POST", upstreamPath: "/api/auth/resend-verification" });
}
