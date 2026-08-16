import { create } from "zustand";
import { browserFetch } from "@/lib/api/browser";
import { CART_TOKEN_HEADER, getGuestToken, setGuestToken, clearGuestToken } from "@/lib/cart/guest-token";
import type { CartResponse, CartItem } from "@/types/api";

/** Same shape as CartResponse but with `items` guaranteed to be an array — the API's
 * `items` field is nullable, so every consumer would otherwise need its own `?? []` guard. */
export type NormalizedCart = Omit<CartResponse, "items"> & { items: CartItem[] };

function normalize(cart: CartResponse): NormalizedCart {
  return { ...cart, items: cart.items ?? [] };
}

/** Every cart/checkout call carries the stored guest token — the server ignores it entirely
 * when a logged-in Customer's cookies are also present (blueprint §6.3: an authenticated
 * identity always wins), so it's always safe to attach. */
function guestHeaders(): Record<string, string> {
  const token = getGuestToken();
  return token ? { [CART_TOKEN_HEADER]: token } : {};
}

function captureGuestToken(cart: CartResponse): void {
  if (cart.guestToken) setGuestToken(cart.guestToken);
}

type CartState = {
  cart: NormalizedCart | null;
  itemCount: number;
  isLoading: boolean;
  hasLoaded: boolean;
  setCart: (cart: CartResponse | null) => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, variantId?: string | null) => Promise<NormalizedCart>;
  updateItem: (
    productId: string,
    quantity: number,
    variantId?: string | null
  ) => Promise<NormalizedCart>;
  removeItem: (productId: string, variantId?: string | null) => Promise<NormalizedCart>;
  applyCoupon: (code: string) => Promise<NormalizedCart>;
  applyPromotion: (code: string) => Promise<NormalizedCart>;
  removePromotion: (code: string) => Promise<NormalizedCart>;
  clearCart: () => Promise<void>;
  /** Call right after login/register, before redirecting — merges the guest cart into the
   * customer's, then discards the local guest token (blueprint §6.3). */
  mergeGuestCart: () => Promise<void>;
};

function countItems(cart: NormalizedCart | null): number {
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  itemCount: 0,
  isLoading: false,
  hasLoaded: false,

  setCart: (cart) => {
    const normalized = cart ? normalize(cart) : null;
    set({ cart: normalized, itemCount: countItems(normalized), hasLoaded: true });
  },

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const raw = await browserFetch<CartResponse>("/api/shop/cart", {
        headers: guestHeaders(),
      });
      captureGuestToken(raw);
      const cart = normalize(raw);
      set({ cart, itemCount: countItems(cart), isLoading: false, hasLoaded: true });
    } catch {
      set({ isLoading: false, hasLoaded: true });
    }
  },

  addItem: async (productId, quantity, variantId) => {
    const raw = await browserFetch<CartResponse>("/api/shop/cart/items", {
      method: "POST",
      body: { productId, quantity, variantId: variantId ?? null },
      headers: guestHeaders(),
    });
    captureGuestToken(raw);
    const cart = normalize(raw);
    set({ cart, itemCount: countItems(cart), hasLoaded: true });
    return cart;
  },

  updateItem: async (productId, quantity, variantId) => {
    const raw = await browserFetch<CartResponse>(`/api/shop/cart/items/${productId}`, {
      method: "PUT",
      body: { quantity, variantId: variantId ?? null },
      headers: guestHeaders(),
    });
    captureGuestToken(raw);
    const cart = normalize(raw);
    set({ cart, itemCount: countItems(cart), hasLoaded: true });
    return cart;
  },

  removeItem: async (productId, variantId) => {
    const qs = variantId ? `?variantId=${encodeURIComponent(variantId)}` : "";
    const raw = await browserFetch<CartResponse>(`/api/shop/cart/items/${productId}${qs}`, {
      method: "DELETE",
      headers: guestHeaders(),
    });
    captureGuestToken(raw);
    const cart = normalize(raw);
    set({ cart, itemCount: countItems(cart), hasLoaded: true });
    return cart;
  },

  applyCoupon: async (code) => {
    const raw = await browserFetch<CartResponse>("/api/shop/cart/coupon", {
      method: "POST",
      body: { code },
      headers: guestHeaders(),
    });
    captureGuestToken(raw);
    const cart = normalize(raw);
    set({ cart, itemCount: countItems(cart), hasLoaded: true });
    return cart;
  },

  applyPromotion: async (code) => {
    const raw = await browserFetch<CartResponse>("/api/shop/cart/promotions", {
      method: "POST",
      body: { code },
      headers: guestHeaders(),
    });
    captureGuestToken(raw);
    const cart = normalize(raw);
    set({ cart, itemCount: countItems(cart), hasLoaded: true });
    return cart;
  },

  removePromotion: async (code) => {
    const raw = await browserFetch<CartResponse>(`/api/shop/cart/promotions/${encodeURIComponent(code)}`, {
      method: "DELETE",
      headers: guestHeaders(),
    });
    captureGuestToken(raw);
    const cart = normalize(raw);
    set({ cart, itemCount: countItems(cart), hasLoaded: true });
    return cart;
  },

  clearCart: async () => {
    await browserFetch("/api/shop/cart", { method: "DELETE", headers: guestHeaders() });
    set({ cart: null, itemCount: 0, hasLoaded: true });
  },

  mergeGuestCart: async () => {
    const token = getGuestToken();
    if (!token) {
      await get().fetchCart();
      return;
    }
    try {
      await browserFetch<CartResponse>(`/api/shop/cart/merge?guestToken=${encodeURIComponent(token)}`, {
        method: "POST",
      });
    } finally {
      clearGuestToken();
    }
    await get().fetchCart();
  },
}));
