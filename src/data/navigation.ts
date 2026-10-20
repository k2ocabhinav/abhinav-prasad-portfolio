import type { NavigationItem } from "@/types";

export const navigationItems: NavigationItem[] = [
  { kind: "section", id: "hero", label: "Hero" },
  { kind: "section", id: "about", label: "What I do" },
  { kind: "section", id: "experience", label: "Experience" },
  { kind: "section", id: "work", label: "Work" },
  { kind: "section", id: "stack", label: "Stack" },
  { kind: "section", id: "contact", label: "Contact" },
];

// =============================================================================
// Scroll-spy targets
// -----------------------------------------------------------------------------
// One entry per region of the page that the side-nav tracks, in document order.
// The spy reads whichever element crosses the viewport midline, so every band
// of the page maps to exactly one navigation item and the highlight resolves
// the same way scrolling down or back up.
//
// The marquee keeps the Work chapter active and uses its dark band for the
// navigation rail's contrast mode.
// =============================================================================

export interface NavSpyTarget {
  /** Navigation item highlighted while this element is at the viewport midline. */
  id: string;
  /** CSS selector for the observed element. */
  selector: string;
  /** True when the element paints a dark ink field behind the rail. */
  dark?: boolean;
}

export const navSpyTargets: readonly NavSpyTarget[] = [
  { id: "hero", selector: "#hero" },
  { id: "about", selector: "#about" },
  { id: "experience", selector: "#experience" },
  { id: "work", selector: "#work" },
  { id: "work", selector: "[data-marquee]", dark: true },
  { id: "stack", selector: "#stack" },
  { id: "contact", selector: "#contact" },
];
