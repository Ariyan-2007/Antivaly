import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    // Business/product images are seller-controlled content coming back from the Vastora
    // API — they can be hosted on literally any CDN/host the seller uploaded to (S3,
    // Cloudinary, imgur, their own server, ...). next/image throws a hard render-time error
    // (crashing the whole page, not just the image) for any host not explicitly allowed, so
    // this intentionally allows any HTTPS host rather than a fixed allowlist we can't predict.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      // Local dev convenience so NEXT_PUBLIC_API_BASE_URL can point at a local/mock API.
      ...(process.env.NODE_ENV !== "production"
        ? [{ protocol: "http" as const, hostname: "**" }]
        : []),
    ],
  },
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
