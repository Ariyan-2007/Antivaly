import { API_BASE_URL } from "@/lib/constants";

/**
 * Image fields coming back from the API (product images, business logo/banner, avatars) can
 * be either a full URL (seller-hosted, any CDN) or a path relative to the API host (local-disk
 * uploads, e.g. `/uploads/...`) — `new URL(url, API_BASE_URL)` resolves either case correctly,
 * leaving an already-absolute URL unchanged. next/image throws a hard render-time error
 * (crashing the whole page, not just the image) for a `src` that isn't a well-formed absolute
 * http(s) URL, so every `<Image>` using API-sourced data must resolve through this first —
 * returns undefined for anything that still isn't valid after resolving, so callers can gate
 * on it directly.
 */
export function resolveApiImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const resolved = new URL(url, API_BASE_URL);
    return resolved.protocol === "http:" || resolved.protocol === "https:"
      ? resolved.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function firstValidImage(images: string[] | null | undefined): string | undefined {
  for (const image of images ?? []) {
    const resolved = resolveApiImageUrl(image);
    if (resolved) return resolved;
  }
  return undefined;
}
