import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  Fraunces,
  Fragment_Mono,
  Hanken_Grotesk,
  Newsreader,
} from "next/font/google";
import AppProviders from "@/components/providers/AppProviders";
import { getProfileContent } from "@/lib/portfolioContent";
import { absoluteUrl, siteConfig } from "@/lib/siteConfig";
import "./globals.css";

// =============================================================================
// Root Layout — Fonts, metadata, HTML structure
// "Print Room" system: Fraunces (display/wordmark), Newsreader (prose serif),
// Hanken Grotesk (UI + body), Fragment Mono (meta labels).
// =============================================================================

// Display + wordmark — expressive high-contrast serif; the wordmark forces
// opsz 144 / WONK 1 via font-variation-settings in AnimatedName.module.css.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Prose serif — editorial reading moments and italic accents.
const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-headline",
  display: "swap",
});

// UI + body workhorse.
const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

// Meta/eyebrow labels — mono, uppercase, tracked.
const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-label",
  display: "swap",
});

const profile = getProfileContent();
const seo = profile.seo;
const title = seo?.title ?? `${profile.personal.fullName} — Engineering Portfolio`;
const description = seo?.description ?? profile.personal.subtitle;
const author = seo?.author ?? profile.personal.fullName;
const openGraphImage = seo?.ogImage ?? "/og-image.jpg";

export const metadata: Metadata = {
  metadataBase: siteConfig.url,
  title: {
    default: title,
    template: `%s | ${profile.personal.fullName}`,
  },
  description,
  applicationName: `${profile.personal.fullName} — Engineering Portfolio`,
  keywords: seo?.keywords,
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
    siteName: `${profile.personal.fullName} — Engineering Portfolio`,
    title,
    description,
    url: absoluteUrl("/"),
    images: [
      {
        url: openGraphImage,
        width: 1200,
        height: 630,
        alt: `${profile.personal.fullName}'s editorial engineering portfolio`,
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
        alt: `${profile.personal.fullName}'s editorial engineering portfolio`,
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
      className={`${fraunces.variable} ${newsreader.variable} ${hankenGrotesk.variable} ${fragmentMono.variable}`}
    >
      <body>
        <AppProviders>{children}</AppProviders>
        {process.env.VERCEL === "1" ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
