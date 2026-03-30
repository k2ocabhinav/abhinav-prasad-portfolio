import type { LandingHeroContent } from "@/types";
import { projects } from "./projects";

// =============================================================================
// Landing Page Data — Hero content and enriched project data for the work stack
// =============================================================================

export const landingHero: LandingHeroContent = {
  // Rendered at Syne 800, clamp(3.25rem, 8vw, 8rem). The \n creates a
  // line-break between words — each line animates in separately via mask reveal.
  displayTitle: "Software\nArchitect",
  displayTitleAccent: "& Creative Technologist",
  supportingCopy:
    "Building the invisible architecture that powers digital ecosystems. Distributed systems, cloud platforms, and AI-driven experiences — engineered with precision and craft.",
  ctas: [
    {
      label: "View Selected Work",
      // Targets the Frame 2 sticky scroll container
      href: "#selected-work",
      variant: "primary",
    },
    {
      label: "Get in Touch",
      href: "#contact",
      variant: "secondary",
    },
  ],
};

/**
 * Projects enriched for the landing work stack.
 * Adds shortDescription (first sentence only) for the compact meta panel.
 * Derives from existing projects array — add/remove projects in data/projects.ts.
 */
export const landingProjects = projects.map((p) => ({
  ...p,
  shortDescription: p.description.split(".")[0] + ".",
}));
