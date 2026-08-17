import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Orders live under /account/orders now, already covered by /*/account.
      disallow: ["/*/account", "/*/cart", "/*/checkout", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
