import type { ShippingAddress } from "@/types/api";

/** There's no saved-address book on the API (blueprint §6.5) — the checkout address form has
 * to be filled in every time. This is the frontend's own client-side convenience the blueprint
 * explicitly suggests instead: remember the last address this browser checked out with and
 * pre-fill the form, for both guests and signed-in customers (device-level, not account-level,
 * since there's nowhere server-side to store it). */

const STORAGE_KEY = "av_last_checkout_address";

export function getLastCheckoutAddress(): ShippingAddress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ShippingAddress) : null;
  } catch {
    return null;
  }
}

export function setLastCheckoutAddress(address: ShippingAddress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(address));
  } catch {
    // Best-effort only — the order itself already went through.
  }
}
