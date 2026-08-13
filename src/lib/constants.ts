export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.vastora.app";

export const BUSINESS_SLUG = process.env.NEXT_PUBLIC_BUSINESS_SLUG ?? "antivaly";

/** Fallback when BusinessResponse.currency is missing/empty — should basically never be seen. */
export const DEFAULT_CURRENCY = "USD";

/** This storefront's own public URL (not the API's) — used for canonical links, sitemap, robots.txt. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://antivaly.com").replace(
  /\/$/,
  ""
);

/**
 * There is no delivery-zone or distance-based fee calculation on the Vastora backend yet
 * (blueprint §6.4) — `deliveryFee` on checkout is entirely caller-supplied. This is a
 * placeholder flat-rate policy the business should confirm/tune; it is not derived from
 * any backend logic.
 */
export const DELIVERY_FEE = {
  insideDhaka: 60,
  outsideDhaka: 120,
  /** Cart subtotal (in the business's currency) at or above which delivery is free. */
  freeThreshold: 2000,
};

export function computeDeliveryFee(city: string | null | undefined, subtotal: number): number {
  if (subtotal >= DELIVERY_FEE.freeThreshold) return 0;
  return /dhaka/i.test((city ?? "").trim()) ? DELIVERY_FEE.insideDhaka : DELIVERY_FEE.outsideDhaka;
}

/** Products at/under this stock count show a low-stock urgency indicator. */
export const LOW_STOCK_THRESHOLD = 5;
