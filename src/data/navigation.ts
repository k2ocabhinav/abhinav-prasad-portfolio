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
