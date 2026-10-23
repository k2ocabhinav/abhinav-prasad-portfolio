import type { NextConfig } from "next";
import path from "path";

// One-year immutable caching for content-hashed assets only. HTML must never
// receive this (it is not hashed and changes on every deploy).
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
const isProd = process.env.NODE_ENV === "production";
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "manifest-src 'self'",
  // Keep wasm-unsafe-eval out unless the Beyond route proves its renderer needs it.
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(process.env.VERCEL === "1" ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  devIndicators: false,
  poweredByHeader: false,
  experimental: {
    // Keep inlineCss on: on throttled mobile it removes a render-blocking CSS
    // round trip. Measured (Lighthouse mobile ×3 medians, Fast-3G-ish):
    // on → home FCP 1016 ms / beyond 875 ms; off → 1763 ms / 2111 ms.
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
    // Portfolio captures carry an eight-character source hash in their URL,
    // which gives each changed image a fresh optimizer cache key. Other project
    // images keep their existing names, so this bounded TTL limits stale variants.
    minimumCacheTTL: 86400,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...(isProd
            ? [{ key: "Content-Security-Policy", value: CSP }]
            : []),
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=(), browsing-topics=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
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
      {
        // Sky phase icons have content hashes in their filenames.
        source: "/icons/:asset(sky-[a-z]+\\.[a-f0-9]{8}\\.svg)",
        headers: [{ key: "Cache-Control", value: IMMUTABLE_CACHE }],
      },
      {
        // Every file in this directory is emitted by the content-hashed
        // portfolio capture script.
        source: "/projects/portfolio-platform/:asset",
        headers: [{ key: "Cache-Control", value: IMMUTABLE_CACHE }],
      },
      {
        // Home and Beyond share cards also use content-hashed public files.
        source: "/og-image\\.:digest([a-f0-9]{8})\\.jpg",
        headers: [{ key: "Cache-Control", value: IMMUTABLE_CACHE }],
      },
      {
        // Prerendered HTML. Next emits `s-maxage=31536000` with no browser
        // `max-age`, so every repeat navigation revalidates. A short browser
        // `max-age` lets a returning tab reuse its copy for a minute while the
        // ETag still revalidates promptly after a deploy; the long CDN
        // `s-maxage` is preserved. The negative lookahead keeps hashed assets,
        // images and dotted files off this rule.
        source: "/((?!_next/|favicon.ico|.*\\..*).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, s-maxage=31536000",
          },
        ],
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
