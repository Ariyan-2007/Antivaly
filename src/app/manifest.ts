import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Antivaly",
    short_name: "Antivaly",
    description: "Fast, reliable, and trustworthy online shopping.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#E4092C",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
