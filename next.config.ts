import type { NextConfig } from "next";
import path from "path";

// One-year immutable caching for content-hashed assets only. HTML must never
// receive this (it is not hashed and changes on every deploy).
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  devIndicators: false,
  experimental: {
    inlineCss: true,
  },
  images: {
    // Serve AVIF where supported, WebP otherwise. The case-study PNGs are the
    // heaviest public assets and drop 30–50% under either format.
    formats: ["image/avif", "image/webp"],
    // Source art tops out at 1920px, so the generated ladder stops there — the
    // default 2048/3840 entries only widened every srcset for nothing.
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    // Optimized variants are keyed by (url, width, quality) and are safe to
    // hold for a year; the default four hours forced repeat re-fetches.
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        // Content-hashed build output: chunks, inline CSS bundles and the
        // self-hosted woff2 fonts. Next already sends this; it is declared
        // explicitly so the caching contract is visible in one place.
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: IMMUTABLE_CACHE }],
      },
      {
        // The app emits the icon as /favicon.ico?favicon.<hash>.ico, but Next
        // serves it `must-revalidate`, so every visit re-fetches ~25 KB. Browser
        // requests go to that hashed URL, which changes whenever the icon does.
        // This rule (path match, so it also covers the bare /favicon.ico) is the
        // one hashed asset Next does not already cache immutably.
        source: "/favicon.ico",
        headers: [{ key: "Cache-Control", value: IMMUTABLE_CACHE }],
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
