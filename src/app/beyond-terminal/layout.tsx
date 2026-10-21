import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import BeyondShell from "@/components/beyond-terminal/BeyondShell";
import ExperienceProvidersBoundary from "@/components/providers/ExperienceProvidersBoundary";
import { absoluteUrl } from "@/lib/siteConfig";

const display = localFont({
  src: "./fonts/bricolage-grotesque-latin.woff2",
  variable: "--font-beyond-display",
  weight: "400 800",
  display: "swap",
});

const body = localFont({
  src: "./fonts/plus-jakarta-sans-latin.woff2",
  variable: "--font-beyond-body",
  weight: "400 700",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/space-mono-subset.woff",
  variable: "--font-beyond-mono",
  weight: "400",
  display: "swap",
});

const beyondTitle = "Beyond the terminal";
const beyondDescription =
  "A small room for photos, notes and moments outside the work.";
const beyondImage = {
  url: absoluteUrl("/og-image.82ccc069.jpg"),
  width: 1200,
  height: 630,
  alt: "Abhinav Prasad, Beyond the terminal",
};

export const metadata: Metadata = {
  title: {
    default: beyondTitle,
    template: `%s | ${beyondTitle}`,
  },
  description: beyondDescription,
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: absoluteUrl("/beyond-terminal"),
  },
  openGraph: {
    type: "website",
    title: beyondTitle,
    description: beyondDescription,
    url: absoluteUrl("/beyond-terminal"),
    images: [beyondImage],
  },
  twitter: {
    card: "summary_large_image",
    title: beyondTitle,
    description: beyondDescription,
    images: [beyondImage],
  },
};

export default function BeyondTerminalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <ExperienceProvidersBoundary>
        <BeyondShell>{children}</BeyondShell>
      </ExperienceProvidersBoundary>
    </div>
  );
}
