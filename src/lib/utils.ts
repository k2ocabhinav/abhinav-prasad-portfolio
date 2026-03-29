// =============================================================================
// Utility Functions
// =============================================================================

import { createElement } from "react";
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
