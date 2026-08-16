"use client";

import { createContext, useContext } from "react";
import type { BusinessResponse } from "@/types/api";

/**
 * Client-side access to the Business's feature flags (tax, returns, reviews, guest checkout,
 * delivery) and identity (id/tenantId/currency) — needed by checkout, product reviews,
 * wishlist, and account components. Seeded directly from the `BusinessResponse` the root
 * layout already fetches server-side (src/app/[locale]/layout.tsx) — no extra client fetch.
 */
const BusinessContext = createContext<BusinessResponse | null>(null);

export function BusinessProvider({
  business,
  children,
}: {
  business: BusinessResponse;
  children: React.ReactNode;
}) {
  return <BusinessContext.Provider value={business}>{children}</BusinessContext.Provider>;
}

/** Throws if rendered outside BusinessProvider — every client component under the locale layout has it. */
export function useBusiness(): BusinessResponse {
  const business = useContext(BusinessContext);
  if (!business) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return business;
}
