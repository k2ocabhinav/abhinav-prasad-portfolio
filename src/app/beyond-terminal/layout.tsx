import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import type { ReactNode } from "react";
import BeyondShell from "@/components/beyond-terminal/BeyondShell";
import ExperienceProvidersBoundary from "@/components/providers/ExperienceProvidersBoundary";
import { absoluteUrl } from "@/lib/siteConfig";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-beyond-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-beyond-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-beyond-mono",
  weight: "400",
  display: "swap",
});

const beyondTitle = "Beyond The Terminal";
const beyondDescription =
  "A colorful photo wall for people, events, notes, and the parts that do not fit inside a resume.";
const beyondImage = {
  url: absoluteUrl("/og-image.82ccc069.jpg"),
  width: 1200,
  height: 630,
  alt: "Abhinav Prasad, Beyond The Terminal photo wall",
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
