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

// Four distinct iridescent hues so per-tile accents read as multi-color
// (previously peach + sky both collapsed to one accent → duo-tone).
const landingAccentColorMap: Record<LandingAccentKey, string> = {
  sage: "var(--color-primary-brand)", // Holo Lilac
  peach: "var(--color-gold)", // Ion Gold
  sky: "var(--color-teal)", // Plasma Teal
  sand: "var(--color-secondary-text)",
};

const landingAccentRgbMap: Record<LandingAccentKey, string> = {
  sage: "var(--color-primary-brand-rgb)",
  peach: "var(--color-gold-rgb)",
  sky: "var(--color-teal-rgb)",
  sand: "154, 152, 173",
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
