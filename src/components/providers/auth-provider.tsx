"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { browserFetch } from "@/lib/api/browser";
import type { UserSummaryResponse } from "@/types/api";

type AuthContextValue = {
  user: UserSummaryResponse | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  setUser: (user: UserSummaryResponse | null) => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  refresh: async () => {},
  setUser: () => {},
});

/**
 * Session is fetched client-side (never during the server render) so that public pages
 * (home/products/categories/product detail) can stay statically generated / ISR-cached
 * instead of being forced dynamic by a per-request cookie read in the shared layout.
 * Private pages (cart/checkout/orders/account) still gate server-side via
 * src/lib/auth/session.ts — this provider only drives header/nav UI state.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await browserFetch<UserSummaryResponse>("/api/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // One-time fetch-on-mount with no external store to subscribe to instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext).user;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
