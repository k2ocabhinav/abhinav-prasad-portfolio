import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  Fraunces,
  Fragment_Mono,
  Hanken_Grotesk,
  Newsreader,
} from "next/font/google";
import localFont from "next/font/local";
import AppProviders from "@/components/providers/AppProviders";
import { getProfileContent } from "@/lib/portfolioContent";
import { absoluteUrl, siteConfig } from "@/lib/siteConfig";
import "./globals.css";

// =============================================================================
// Root Layout — Fonts, metadata, HTML structure
// "Print Room" system: Fraunces (display/brand mark), Newsreader (prose serif),
// Hanken Grotesk (UI + body), Fragment Mono (meta labels).
// =============================================================================

// Display face for editorial headings. The fixed wordmark subset is embedded
// in critical CSS so the first visible frame already uses Fraunces.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "WONK"],
  style: "normal",
  variable: "--font-display",
  display: "swap",
  preload: false,
});

const frauncesWordmark = localFont({
  src: "./fonts/fraunces-wordmark.woff2",
  weight: "600",
  style: "normal",
  variable: "--font-wordmark",
  display: "swap",
  preload: true,
});

const frauncesItalic = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "WONK"],
  style: "italic",
  variable: "--font-display",
  display: "swap",
  preload: false,
});

// Prose serif — editorial reading moments and italic accents. Newsreader's
// optical-size axis is load-bearing (prose runs from 1rem standfirsts up to
// 3rem section headings), so it is kept. The roman face styles the hero value
// sentence, so it is preloaded; the italic is a marquee and bridge accent.
const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: "normal",
  variable: "--font-headline",
  display: "swap",
});

const newsreaderItalic = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: "italic",
  variable: "--font-headline",
  // Detail page titles use this face above the fold. Its fallback is close in
  // shape and already reserves the taller phone title box, so avoid a late swap.
  display: "optional",
  preload: false,
});

// UI + body workhorse. Weights 400 (body) and 600 (bold `strong` runs) are
// used, with 500 kept so mid-weight highlights never fall back to faux bold.
// Body copy starts below the hero on every route, so this face is not preloaded
// — it loads on first use instead of competing with the LCP fonts.
const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
  preload: false,
});

// Meta/eyebrow labels — mono, uppercase, tracked. Used by the nav and hero
// eyebrow, so it stays preloaded.
const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-label",
  display: "swap",
});

const profile = getProfileContent();
const seo = profile.seo;
const title = seo.title;
const description = seo.description;
const author = seo.author;
const openGraphImage = seo.ogImage;

export const metadata: Metadata = {
  metadataBase: siteConfig.url,
  title: {
    default: title,
    template: `%s | ${profile.personal.fullName}`,
  },
  description,
  applicationName: `${profile.personal.fullName} | Engineering Portfolio`,
  keywords: seo.keywords,
  authors: [{ name: author, url: absoluteUrl("/") }],
  creator: profile.personal.fullName,
  publisher: profile.personal.fullName,
  alternates: {
    canonical: "/",
  },
  robots: siteConfig.isIndexable
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
        },
      },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: `${profile.personal.fullName} | Engineering Portfolio`,
    title,
    description,
    url: absoluteUrl("/"),
    images: [
      {
        url: openGraphImage,
        width: 1200,
        height: 630,
        alt: `${profile.personal.fullName}, software engineer building products end to end`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [
      {
        url: openGraphImage,
        width: 1200,
        height: 630,
        alt: `${profile.personal.fullName}, software engineer building products end to end`,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${frauncesWordmark.variable} ${frauncesItalic.variable} ${newsreader.variable} ${newsreaderItalic.variable} ${hankenGrotesk.variable} ${fragmentMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Marks JS as available before first paint, so reveal start states
            apply only when the animation can actually run. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.dataset.js='1'",
          }}
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
        {process.env.VERCEL === "1" ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
