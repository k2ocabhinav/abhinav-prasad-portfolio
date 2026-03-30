// =============================================================================
// Utility Functions
// =============================================================================

import { createElement, type CSSProperties } from "react";
import type { LandingAccentKey } from "@/types";
import {
  Cloud,
  Database,
  Terminal,
  Sparkles,
  Cpu,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

/**
 * Resolve icon string key to Lucide component.
 * This keeps data files free of JSX imports.
 */
const iconMap: Record<string, LucideIcon> = {
  cloud: Cloud,
  database: Database,
  terminal: Terminal,
  sparkles: Sparkles,
  cpu: Cpu,
};

export function resolveIcon(key: string): LucideIcon {
  return iconMap[key] ?? Terminal;
}

/**
 * Render an icon from a string key without creating a new component type inside render.
 */
export function renderIcon(key: string, props?: LucideProps) {
  return createElement(resolveIcon(key), props);
}

/**
 * Smooth scroll to a section by ID
 */
export function scrollToSection(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/**
 * Conditionally join class names (simple cn utility)
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const landingAccentColorMap: Record<LandingAccentKey, string> = {
  sage: "var(--color-sage)",
  peach: "var(--color-accent-peach-soft)",
  sky: "var(--color-accent-sky-soft)",
  sand: "var(--color-accent-sand-soft)",
};

const landingAccentRgbMap: Record<LandingAccentKey, string> = {
  sage: "var(--color-sage-rgb)",
  peach: "var(--color-accent-peach-rgb)",
  sky: "var(--color-accent-sky-rgb)",
  sand: "var(--color-accent-sand-rgb)",
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
