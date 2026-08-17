/** Anonymous cart identity (blueprint §6.3) — persisted client-side, sent as `X-Cart-Token`. */

export const CART_TOKEN_HEADER = "X-Cart-Token";
const STORAGE_KEY = "av_guest_cart_token";

export function getGuestToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setGuestToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, token);
}

export function clearGuestToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
