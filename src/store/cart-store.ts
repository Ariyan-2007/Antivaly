import { create } from "zustand";
import { browserFetch } from "@/lib/api/browser";
import { CART_TOKEN_HEADER, getGuestToken, setGuestToken, clearGuestToken } from "@/lib/cart/guest-token";
import type { AvailableOfferResponse, CartResponse, CartItem, FulfillmentMethod } from "@/types/api";

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
  /** Count of in-flight cart mutations (item/coupon/promotion/gift-card/store-credit/fulfillment).
   * Lets any button that depends on the cart being in a settled state — "Proceed to Checkout",
   * "Place Order" — disable itself while another part of the page is still writing to the cart,
   * instead of racing a stale read against an in-flight update. */
  mutatingCount: number;
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
  /** DELETE /api/shop/cart/coupon — added alongside the backend (Vastora repo) to close the
   * gap where a coupon, unlike promotions/gift-cards, previously had no way to be removed. */
  removeCoupon: () => Promise<NormalizedCart>;
  applyPromotion: (code: string) => Promise<NormalizedCart>;
  removePromotion: (code: string) => Promise<NormalizedCart>;
  /** §9.43 — a gift card applied here is priced back into the cart live, not just at checkout. */
  applyGiftCard: (code: string) => Promise<NormalizedCart>;
  removeGiftCard: (code: string) => Promise<NormalizedCart>;
  /** Customer only — a guest has no balance to opt into. */
  setUseStoreCredit: (useStoreCredit: boolean) => Promise<NormalizedCart>;
  /** §9.44 — preview-only fulfillment choice on the cart itself, so deliveryFee/shippingOptions
   * are known before an address is ever entered. Guest and Customer both. */
  setFulfillmentMethod: (fulfillmentMethod: FulfillmentMethod) => Promise<NormalizedCart>;
  availableOffers: AvailableOfferResponse[];
  /** Public coupon/promotion codes worth surfacing before the shopper types anything
   * (blueprint §6.6) — re-fetch whenever the cart changes. */
  fetchAvailableOffers: () => Promise<void>;
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
  mutatingCount: 0,
  availableOffers: [],

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
    set((s) => ({ mutatingCount: s.mutatingCount + 1 }));
    try {
      const raw = await browserFetch<CartResponse>("/api/shop/cart/items", {
        method: "POST",
        body: { productId, quantity, variantId: variantId ?? null },
        headers: guestHeaders(),
      });
      captureGuestToken(raw);
      const cart = normalize(raw);
      set({ cart, itemCount: countItems(cart), hasLoaded: true });
      return cart;
    } finally {
      set((s) => ({ mutatingCount: s.mutatingCount - 1 }));
    }
  },

  updateItem: async (productId, quantity, variantId) => {
    set((s) => ({ mutatingCount: s.mutatingCount + 1 }));
    try {
      const raw = await browserFetch<CartResponse>(`/api/shop/cart/items/${productId}`, {
        method: "PUT",
        body: { quantity, variantId: variantId ?? null },
        headers: guestHeaders(),
      });
      captureGuestToken(raw);
      const cart = normalize(raw);
      set({ cart, itemCount: countItems(cart), hasLoaded: true });
      return cart;
    } finally {
      set((s) => ({ mutatingCount: s.mutatingCount - 1 }));
    }
  },

  removeItem: async (productId, variantId) => {
    set((s) => ({ mutatingCount: s.mutatingCount + 1 }));
    try {
      const qs = variantId ? `?variantId=${encodeURIComponent(variantId)}` : "";
      const raw = await browserFetch<CartResponse>(`/api/shop/cart/items/${productId}${qs}`, {
        method: "DELETE",
        headers: guestHeaders(),
      });
      captureGuestToken(raw);
      const cart = normalize(raw);
      set({ cart, itemCount: countItems(cart), hasLoaded: true });
      return cart;
    } finally {
      set((s) => ({ mutatingCount: s.mutatingCount - 1 }));
    }
  },

  applyCoupon: async (code) => {
    set((s) => ({ mutatingCount: s.mutatingCount + 1 }));
    try {
      const raw = await browserFetch<CartResponse>("/api/shop/cart/coupon", {
        method: "POST",
        body: { code },
        headers: guestHeaders(),
      });
      captureGuestToken(raw);
      const cart = normalize(raw);
      set({ cart, itemCount: countItems(cart), hasLoaded: true });
      return cart;
    } finally {
      set((s) => ({ mutatingCount: s.mutatingCount - 1 }));
    }
  },

  removeCoupon: async () => {
    set((s) => ({ mutatingCount: s.mutatingCount + 1 }));
    try {
      const raw = await browserFetch<CartResponse>("/api/shop/cart/coupon", {
        method: "DELETE",
        headers: guestHeaders(),
      });
      captureGuestToken(raw);
      const cart = normalize(raw);
      set({ cart, itemCount: countItems(cart), hasLoaded: true });
      return cart;
    } finally {
      set((s) => ({ mutatingCount: s.mutatingCount - 1 }));
    }
  },

  applyPromotion: async (code) => {
    set((s) => ({ mutatingCount: s.mutatingCount + 1 }));
    try {
      const raw = await browserFetch<CartResponse>("/api/shop/cart/promotions", {
        method: "POST",
        body: { code },
        headers: guestHeaders(),
      });
      captureGuestToken(raw);
      const cart = normalize(raw);
      set({ cart, itemCount: countItems(cart), hasLoaded: true });
      return cart;
    } finally {
      set((s) => ({ mutatingCount: s.mutatingCount - 1 }));
    }
  },

  removePromotion: async (code) => {
    set((s) => ({ mutatingCount: s.mutatingCount + 1 }));
    try {
      const raw = await browserFetch<CartResponse>(`/api/shop/cart/promotions/${encodeURIComponent(code)}`, {
        method: "DELETE",
        headers: guestHeaders(),
      });
      captureGuestToken(raw);
      const cart = normalize(raw);
      set({ cart, itemCount: countItems(cart), hasLoaded: true });
      return cart;
    } finally {
      set((s) => ({ mutatingCount: s.mutatingCount - 1 }));
    }
  },

  applyGiftCard: async (code) => {
    set((s) => ({ mutatingCount: s.mutatingCount + 1 }));
    try {
      const raw = await browserFetch<CartResponse>("/api/shop/cart/gift-cards", {
        method: "POST",
        body: { code },
        headers: guestHeaders(),
      });
      captureGuestToken(raw);
      const cart = normalize(raw);
      set({ cart, itemCount: countItems(cart), hasLoaded: true });
      return cart;
    } finally {
      set((s) => ({ mutatingCount: s.mutatingCount - 1 }));
    }
  },

  removeGiftCard: async (code) => {
    set((s) => ({ mutatingCount: s.mutatingCount + 1 }));
    try {
      const raw = await browserFetch<CartResponse>(`/api/shop/cart/gift-cards/${encodeURIComponent(code)}`, {
        method: "DELETE",
        headers: guestHeaders(),
      });
      captureGuestToken(raw);
      const cart = normalize(raw);
      set({ cart, itemCount: countItems(cart), hasLoaded: true });
      return cart;
    } finally {
      set((s) => ({ mutatingCount: s.mutatingCount - 1 }));
    }
  },

  setUseStoreCredit: async (useStoreCredit) => {
    set((s) => ({ mutatingCount: s.mutatingCount + 1 }));
    try {
      const raw = await browserFetch<CartResponse>("/api/shop/cart/store-credit", {
        method: "PUT",
        body: { useStoreCredit },
      });
      const cart = normalize(raw);
      set({ cart, itemCount: countItems(cart), hasLoaded: true });
      return cart;
    } finally {
      set((s) => ({ mutatingCount: s.mutatingCount - 1 }));
    }
  },

  setFulfillmentMethod: async (fulfillmentMethod) => {
    set((s) => ({ mutatingCount: s.mutatingCount + 1 }));
    try {
      const raw = await browserFetch<CartResponse>("/api/shop/cart/fulfillment-method", {
        method: "PUT",
        body: { fulfillmentMethod },
        headers: guestHeaders(),
      });
      captureGuestToken(raw);
      const cart = normalize(raw);
      set({ cart, itemCount: countItems(cart), hasLoaded: true });
      return cart;
    } finally {
      set((s) => ({ mutatingCount: s.mutatingCount - 1 }));
    }
  },

  fetchAvailableOffers: async () => {
    try {
      const offers = await browserFetch<AvailableOfferResponse[]>("/api/shop/cart/available-offers", {
        headers: guestHeaders(),
      });
      set({ availableOffers: offers ?? [] });
    } catch {
      set({ availableOffers: [] });
    }
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
