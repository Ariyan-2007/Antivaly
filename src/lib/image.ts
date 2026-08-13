/**
 * next/image throws a hard render-time error (crashing the whole page, not just the image)
 * for a `src` that isn't a well-formed absolute URL — and product/business images are
 * seller-supplied data from the API, not something this app controls the shape of. Every
 * `<Image>` using API-sourced data should gate on this first.
 */
export function isValidImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function firstValidImage(images: string[] | null | undefined): string | undefined {
  return images?.find(isValidImageUrl);
}
