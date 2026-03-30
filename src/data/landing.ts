import type { LandingHeroContent, LandingStory } from "@/types";

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
      label: "Explore Stories",
      // Targets the Frame 2 sticky scroll container
      href: "#story-vignettes",
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
 * Story vignettes for the landing motion frame.
 * These are intentionally conceptual rather than literal portfolio entries so
 * the landing sequence can stay distinct from the real Works section below.
 */
export const landingStories: LandingStory[] = [
  {
    id: "01",
    eyebrow: "Systems Thinking",
    title: "Signal Before Scale",
    summary:
      "Framing the first API, queue, and boundary decisions before complexity hardens into cost.",
    tags: ["Discovery", "Boundaries", "Scalability"],
    icon: "cpu",
    accent: "sage",
    note: "Concept vignette — not a portfolio case study.",
  },
  {
    id: "02",
    eyebrow: "Cloud Orchestration",
    title: "The Quiet Handoff",
    summary:
      "Designing retries, ownership seams, and data movement so critical workflows keep running when humans are asleep.",
    tags: ["Pipelines", "Reliability", "Ops"],
    icon: "cloud",
    accent: "peach",
    note: "Concept vignette — focused on operational calm.",
  },
  {
    id: "03",
    eyebrow: "Interaction Systems",
    title: "Interfaces That Explain Themselves",
    summary:
      "Using motion, pacing, and hierarchy so technically dense products feel obvious at first glance.",
    tags: ["Motion", "Clarity", "UX Systems"],
    icon: "sparkles",
    accent: "sky",
    note: "Concept vignette — focused on legibility and trust.",
  },
  {
    id: "04",
    eyebrow: "AI Product Thinking",
    title: "AI With Guardrails",
    summary:
      "Treating AI as governed product behavior with evaluation loops, human review, and safe failure paths.",
    tags: ["LLM", "Evaluation", "Safety"],
    icon: "terminal",
    accent: "sand",
    note: "Concept vignette — focused on responsible system design.",
  },
];
