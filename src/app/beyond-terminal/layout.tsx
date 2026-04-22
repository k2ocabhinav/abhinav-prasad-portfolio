import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import BeyondShell from "@/components/beyond-terminal/BeyondShell";

const display = Archivo({
  subsets: ["latin"],
  variable: "--font-beyond-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-beyond-body",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-beyond-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Beyond The Terminal",
    template: "%s | Beyond The Terminal",
  },
  description:
    "A pastel-grid editorial side route for travel, books, training, and field notes.",
};

export default function BeyondTerminalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={`${display.variable} ${body.variable} ${plexMono.variable}`}>
      <BeyondShell>{children}</BeyondShell>
    </div>
  );
}
