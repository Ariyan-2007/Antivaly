import type { UpdateNotificationPreferencesRequest } from "@/types/api";

/** The Vastora API has no GET for notification preferences (blueprint §6.5 lists PUT only),
 * so there's no way to know a customer's current settings on page load. This caches the last
 * value this browser itself successfully saved, scoped per customer, so revisiting the
 * account page doesn't show (and risk re-saving) a blank opt-out state over real opt-ins —
 * a thin client-side cache of a write-only resource, not an authoritative read. */

function storageKey(userId: string): string {
  return `av_notification_prefs:${userId}`;
}

export function getCachedNotificationPreferences(
  userId: string
): UpdateNotificationPreferencesRequest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as UpdateNotificationPreferencesRequest) : null;
  } catch {
    return null;
  }
}

export function setCachedNotificationPreferences(
  userId: string,
  values: UpdateNotificationPreferencesRequest
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(values));
  } catch {
    // Storage unavailable/full — the save to the server already succeeded, so this is
    // best-effort only.
  }
}
