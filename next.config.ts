import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Whether the *configured* API host is local/private — not whether this is a dev or prod
// *build*. `next build && next start` still runs with NODE_ENV=production even when
// NEXT_PUBLIC_API_BASE_URL points at a local backend (e.g. testing a production build against
// a local Vastora instance), so gating on NODE_ENV alone would keep blocking local images in
// that case. A real deployment's API_BASE_URL is a public host either way, so this stays safe
// (both patterns below stay closed) once it actually points at one.
const apiHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.vastora.app").hostname;
  } catch {
    return "";
  }
})();
const isLocalApiHost =
  apiHost === "localhost" ||
  apiHost === "127.0.0.1" ||
  apiHost === "::1" ||
  /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(apiHost);

const nextConfig: NextConfig = {
  images: {
    // Business/product images are seller-controlled content coming back from the Vastora
    // API — they can be hosted on literally any CDN/host the seller uploaded to (S3,
    // Cloudinary, imgur, their own server, ...). next/image throws a hard render-time error
    // (crashing the whole page, not just the image) for any host not explicitly allowed, so
    // this intentionally allows any HTTPS host rather than a fixed allowlist we can't predict.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      // Only needed so a local (http, non-TLS) API host works — matches isLocalApiHost below.
      ...(isLocalApiHost ? [{ protocol: "http" as const, hostname: "**" }] : []),
    ],
    // Next 16's SSRF guard blocks optimizing images whose host resolves to a private/loopback
    // IP by default — which a local API host always does.
    dangerouslyAllowLocalIP: isLocalApiHost,
  },
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
