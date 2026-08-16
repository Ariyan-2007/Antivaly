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

/** Products at/under this stock count show a low-stock urgency indicator. */
export const LOW_STOCK_THRESHOLD = 5;
