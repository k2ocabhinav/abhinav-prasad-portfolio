import type { Metadata } from "next";
import {
  Fraunces,
  Fragment_Mono,
  Hanken_Grotesk,
  Newsreader,
} from "next/font/google";
import AppProviders from "@/components/providers/AppProviders";
import { getProfileContent } from "@/lib/portfolioContent";
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

const seo = getProfileContent().seo ?? {
  title: "Abhinav - Software Engineer Portfolio",
  description: "Portfolio for Abhinav.",
  keywords: ["Software Engineer", "Portfolio"],
  author: "Abhinav",
  url: "https://abhinav.dev",
  ogImage: "https://abhinav.dev/og-image.jpg",
};

export const metadata: Metadata = {
  metadataBase: new URL(seo.url),
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  authors: [{ name: seo.author }],
  openGraph: {
    type: "website",
    title: seo.title,
    description: seo.description,
    url: seo.url,
    images: [
      {
        url: seo.ogImage,
        width: 1200,
        height: 630,
        alt: "Abhinav's editorial engineering portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
    images: [
      {
        url: seo.ogImage,
        width: 1200,
        height: 630,
        alt: "Abhinav's editorial engineering portfolio",
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
      </body>
    </html>
  );
}
