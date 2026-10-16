// =============================================================================
// Utility Functions
// =============================================================================

import { createElement, type CSSProperties, type ComponentType } from "react";
import type { LandingAccentKey } from "@/types";
import {
  Cloud,
  Database,
  Terminal,
  Cpu,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import StackIcon from "@/components/art/stack-icons/StackIcon";

type IconRenderer = LucideIcon | ComponentType<LucideProps>;

// "sparkles" is the AI coding-agent workflow group's key, fixed by the stack
// icon enum in src/lib/portfolioContent.ts. It is exclusive to that group, so it
// renders the agent glyph instead of the decorative Lucide Sparkles.
const agentsIcon: ComponentType<LucideProps> = ({ size, className }) =>
  createElement(StackIcon, {
    name: "agents",
    size: typeof size === "number" ? size : undefined,
    className,
  });

/**
 * Resolve icon string key to a component.
 * This keeps data files free of JSX imports.
 */
const iconMap: Record<string, IconRenderer> = {
  cloud: Cloud,
  database: Database,
  terminal: Terminal,
  cpu: Cpu,
  sparkles: agentsIcon,
};

export function resolveIcon(key: string): IconRenderer {
  return iconMap[key] ?? Terminal;
}

/**
 * Render an icon from a string key without creating a new component type inside render.
 */
export function renderIcon(key: string, props?: LucideProps) {
  return createElement(resolveIcon(key), props);
}

/**
 * Smooth scroll to a section by ID, and mirror it in the URL hash so sections
 * stay linkable and bookmarkable.
 */
export function scrollToSection(id: string): void {
  const target = document.getElementById(id);
  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: "smooth" });

  if (window.location.hash !== `#${id}`) {
    window.history.replaceState(null, "", `#${id}`);
  }
}

/**
 * Conditionally join class names (simple cn utility)
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Landing accents use the palette v2 section inks. `sand` stays muted for
// tertiary marks.
const landingAccentColorMap: Record<LandingAccentKey, string> = {
  sage: "#6A2135",
  peach: "#4E5312",
  sky: "#25447B",
  sand: "#63605A",
};

const landingAccentRgbMap: Record<LandingAccentKey, string> = {
  sage: "106, 33, 53",
  peach: "78, 83, 18",
  sky: "37, 68, 123",
  sand: "99, 96, 90",
};

/**
 * Provide a consistent CSS-variable contract for landing components that
 * support restrained accent washes without hardcoding palette values inline.
 */
export function getLandingAccentStyle(accent: LandingAccentKey): CSSProperties {
  return {
    ["--landing-accent" as string]: landingAccentColorMap[accent],
    ["--landing-accent-rgb" as string]: landingAccentRgbMap[accent],
  };
}
