import { proxyAuthed } from "@/lib/api/proxy";

/** Irreversible — anonymises the customer's account (blueprint §9.37), orders survive stripped of PII. */
export async function DELETE() {
  return proxyAuthed({ method: "DELETE", upstreamPath: "/api/shop/account" });
}
