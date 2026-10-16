import type { NavigationItem, NavSection } from "@/types";

export const navigationItems: NavigationItem[] = [
  { kind: "section", id: "hero", label: "Hero" },
  { kind: "section", id: "about", label: "About" },
  { kind: "section", id: "experience", label: "Experience" },
  { kind: "section", id: "work", label: "Works" },
  { kind: "section", id: "orchestration", label: "Orchestration" },
  { kind: "section", id: "stack", label: "Tech" },
  { kind: "section", id: "presence", label: "Presence" },
  { kind: "section", id: "contact", label: "Contact" },
];

export const sections: NavSection[] = navigationItems.filter(
  (item): item is NavSection => item.kind === "section"
);

// =============================================================================
// Scroll-spy targets
// -----------------------------------------------------------------------------
// One entry per region of the page that the side-nav tracks, in document order.
// The spy reads whichever element crosses the viewport midline, so every band
// of the page maps to exactly one navigation item and the highlight resolves
// the same way scrolling down or back up.
//
// The landing sequence's Services, Bridge and Profile frames have no navigation
// item of their own: they are part of the hero chapter, so they highlight
// "hero". The burgundy bridge paints a dark ink field, which the nav uses to
// flip its label/dot contrast (see Navigation.module.css).
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
  { id: "hero", selector: 'section[aria-label="Services"]' },
  { id: "hero", selector: "[data-home-explore-bridge]", dark: true },
  { id: "hero", selector: "[data-home-profile-stage]" },
  { id: "about", selector: "#about" },
  { id: "experience", selector: "#experience" },
  { id: "work", selector: "#work" },
  { id: "orchestration", selector: "#orchestration" },
  { id: "orchestration", selector: "[data-marquee]", dark: true },
  { id: "stack", selector: "#stack" },
  { id: "presence", selector: "#presence" },
  { id: "contact", selector: "#contact" },
];
