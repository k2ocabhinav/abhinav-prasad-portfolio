// =============================================================================
// Utility Functions
// =============================================================================

import { createElement, type ComponentType } from "react";
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

  // Lenis is configured with instant smoothing under reduced motion, and the
  // native path must match: jump instead of animating the viewport.
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  target.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });

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
