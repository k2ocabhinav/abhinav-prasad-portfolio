import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, DM_Sans, Syne } from "next/font/google";
import AppProviders from "@/components/providers/AppProviders";
import { seo } from "@/data/seo";
import "./globals.css";

// =============================================================================
// Root Layout — Fonts, metadata, HTML structure
// =============================================================================

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "600"],
  style: ["italic"],
  variable: "--font-headline",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "500"],
  variable: "--font-body",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-label",
  display: "swap",
});

// Landing page display font — geometric, ultra-bold for hero typography
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  authors: [{ name: seo.author }],
  openGraph: {
    type: "website",
    title: seo.title,
    description: seo.description,
    url: seo.url,
    images: [seo.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
    images: [seo.ogImage],
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
      className={`${cormorant.variable} ${plusJakarta.variable} ${dmSans.variable} ${syne.variable}`}
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
