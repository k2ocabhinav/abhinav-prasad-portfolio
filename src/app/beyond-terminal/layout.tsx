import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import type { ReactNode } from "react";
import BeyondShell from "@/components/beyond-terminal/BeyondShell";

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
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Beyond The Terminal",
    template: "%s | Beyond The Terminal",
  },
  description:
    "A colorful photo wall for people, events, notes, and the parts that do not fit inside a resume.",
};

export default function BeyondTerminalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <BeyondShell>{children}</BeyondShell>
    </div>
  );
}
