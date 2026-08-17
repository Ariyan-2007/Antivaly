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

/** Any page-level `generateMetadata` that sets its own `openGraph` object entirely replaces
 * (not merges with) the root layout's — so every one of those needs its own image fallback
 * rather than relying on the layout's or the file-based opengraph-image.png convention. */
export const DEFAULT_OG_IMAGE = "/opengraph-image.png";
