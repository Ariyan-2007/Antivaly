import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/constants";
import { getCategories, getProducts } from "@/lib/api/catalog";
import { categoryHref, productHref } from "@/lib/routes";

function withLocales(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}/${routing.defaultLocale}${path}`,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${SITE_URL}/${locale}${path}`])
      ),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = ["", "/products"].map((path) => withLocales(path));

  // If the API is unreachable during an ISR regeneration, still serve the static entries
  // rather than 500ing the whole sitemap — the previous cached sitemap.xml (if any) also
  // stays servable to crawlers in the meantime.
  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
  ]);

  const categoryEntries = categories
    .filter((c) => c.isActive)
    .map((c) => withLocales(categoryHref(c.id, c.slug)));

  const productEntries = products.map((p) => withLocales(productHref(p.id, p.slug)));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
