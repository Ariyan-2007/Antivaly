import { create } from "zustand";
import { browserFetch } from "@/lib/api/browser";
import type { CartResponse, CartItem } from "@/types/api";

/** Same shape as CartResponse but with `items` guaranteed to be an array — the API's
 * `items` field is nullable, so every consumer would otherwise need its own `?? []` guard. */
export type NormalizedCart = Omit<CartResponse, "items"> & { items: CartItem[] };

function normalize(cart: CartResponse): NormalizedCart {
  return { ...cart, items: cart.items ?? [] };
}

type CartState = {
  cart: NormalizedCart | null;
  itemCount: number;
  isLoading: boolean;
  hasLoaded: boolean;
  setCart: (cart: CartResponse | null) => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<NormalizedCart>;
  updateItem: (productId: string, quantity: number) => Promise<NormalizedCart>;
  removeItem: (productId: string) => Promise<NormalizedCart>;
  applyCoupon: (code: string) => Promise<NormalizedCart>;
  clearCart: () => Promise<void>;
};

function countItems(cart: NormalizedCart | null): number {
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

export const useCartStore = create<CartState>((set) => ({
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
      const cart = normalize(await browserFetch<CartResponse>("/api/shop/cart"));
      set({ cart, itemCount: countItems(cart), isLoading: false, hasLoaded: true });
    } catch {
      set({ isLoading: false, hasLoaded: true });
    }
  },

  addItem: async (productId, quantity) => {
    const cart = normalize(
      await browserFetch<CartResponse>("/api/shop/cart/items", {
        method: "POST",
        body: { productId, quantity },
      })
    );
    set({ cart, itemCount: countItems(cart), hasLoaded: true });
    return cart;
  },

  updateItem: async (productId, quantity) => {
    const cart = normalize(
      await browserFetch<CartResponse>(`/api/shop/cart/items/${productId}`, {
        method: "PUT",
        body: { quantity },
      })
    );
    set({ cart, itemCount: countItems(cart), hasLoaded: true });
    return cart;
  },

  removeItem: async (productId) => {
    const cart = normalize(
      await browserFetch<CartResponse>(`/api/shop/cart/items/${productId}`, {
        method: "DELETE",
      })
    );
    set({ cart, itemCount: countItems(cart), hasLoaded: true });
    return cart;
  },

  applyCoupon: async (code) => {
    const cart = normalize(
      await browserFetch<CartResponse>("/api/shop/cart/coupon", {
        method: "POST",
        body: { code },
      })
    );
    set({ cart, itemCount: countItems(cart), hasLoaded: true });
    return cart;
  },

  clearCart: async () => {
    await browserFetch("/api/shop/cart", { method: "DELETE" });
    set({ cart: null, itemCount: 0, hasLoaded: true });
  },
}));
