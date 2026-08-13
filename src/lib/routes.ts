// Product/category URLs are `/{id}/{slug}` — the id is authoritative for the API call,
// slug is cosmetic for readability/SEO. See ANTIVALY_SHOP_BLUEPRINT.md routing notes.
// The API's slug field is nullable in practice, so these fall back to repeating the id as
// the slug segment rather than producing a broken `/products/{id}/null` URL.
export function productHref(id: string, slug: string | null | undefined): string {
  return `/products/${id}/${slug || id}`;
}

export function categoryHref(id: string, slug: string | null | undefined): string {
  return `/categories/${id}/${slug || id}`;
}

export function orderHref(orderId: string): string {
  return `/orders/${orderId}`;
}
