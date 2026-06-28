import type { LandingHeroContent, LandingStory } from "@/types";

// =============================================================================
// Landing Page Data — Hero content and enriched project data for the work stack
// =============================================================================

export const landingHero: LandingHeroContent = {
  // Single oversized name rendered at Syne 800, clamp(4rem, 18vw, 16rem).
  // Per-letter hover animations handled by AnimatedName component.
  displayTitle: "ABHINAV",
  displayTitleAccent: "& Creative Technologist",
  roleCycleWords: ["Developer", "Architect", "Cloud Engineer", "AI Systems Builder"],
  supportingCopy:
    "Building the invisible architecture that powers digital ecosystems. Distributed systems, cloud platforms, and AI-driven experiences — engineered with precision and craft.",
  ctas: [
    {
      label: "View Featured Work",
      // Targets the Frame 2 sticky scroll container
      href: "#work",
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
 * Featured project stories for the landing motion frame.
 * The sticky engine stays cinematic, but the copy now earns trust with
 * concrete problem, role, shipment, and outcome signals.
 */
export const landingStories: LandingStory[] = [
  {
    id: "01",
    eyebrow: "Product Build",
    title: "Velo - White-Label Dispatch Platform",
    claim: "One dispatch core. Three product roles.",
    summary:
      "A branding-led dispatch suite for rider, driver, and admin operations on one shared real-time core.",
    tags: ["Spring Boot", "PostGIS", "Redis", "Next.js"],
    icon: "cpu",
    accent: "sage",
    note: "Featured proof - full deep dive available in Works.",
    proofBeats: [
      {
        label: "Problem",
        short: "Delivery products were splitting by role and brand.",
        detail:
          "Multi-role delivery operations needed one reusable system without rebuilding the core per brand.",
      },
      {
        label: "My Role",
        short: "Owned the architecture, flows, surfaces, and release checks.",
        detail:
          "Built backend architecture, dispatch paths, admin/rider/driver surfaces, and CI quality gates.",
      },
      {
        label: "Shipped",
        short: "Tenant-aware backend plus live dispatch product scenes.",
        detail:
          "Shipped tenant-aware services, location dispatch, branded screens, and Playwright-backed checks.",
      },
      {
        label: "Impact",
        short: "Turns a service idea into a scalable product system.",
        detail:
          "Shows end-to-end product thinking across architecture, UX surfaces, and production discipline.",
      },
    ],
    visual: {
      kind: "screenshot",
      src: "/projects/velo/02-admin-dispatch.png",
      alt: "Velo admin dispatch screen showing the operational control surface",
      caption: "Live dispatch control surface",
    },
    projectCodeTone: "split",
    proof: {
      problem:
        "Multi-role delivery operations needed one reusable system without rebuilding the core per brand.",
      role:
        "Owned backend architecture, dispatch flows, admin/rider/driver surfaces, and release quality gates.",
      shipped:
        "Tenant-aware backend, location-aware dispatch, branded product scenes, and Playwright-backed checks.",
      value:
        "Shows end-to-end product thinking across architecture, UX surfaces, and production discipline.",
    },
  },
  {
    id: "02",
    eyebrow: "Systems Prototype",
    title: "Flight Management System",
    claim: "Real-time flights. Calm control.",
    summary:
      "A real-time orchestration engine for high-volume flight simulations and low-latency coordination.",
    tags: ["Go", "Redis", "WebSockets", "AWS Lambda"],
    icon: "terminal",
    accent: "sky",
    note: "Featured proof - event-heavy backend systems.",
    proofBeats: [
      {
        label: "Problem",
        short: "Thousands of events needed predictable coordination.",
        detail:
          "Simulation-heavy workflows needed stable service boundaries under high concurrency.",
      },
      {
        label: "My Role",
        short: "Designed event flow, cache strategy, and live updates.",
        detail:
          "Mapped orchestration, Redis-backed state, and WebSocket communication paths.",
      },
      {
        label: "Shipped",
        short: "Concurrent simulation paths with real-time state updates.",
        detail:
          "Built socket updates, Redis state handling, and serverless execution patterns.",
      },
      {
        label: "Impact",
        short: "Reliability becomes visible in the product experience.",
        detail:
          "Signals comfort with latency-sensitive systems where calm behavior matters.",
      },
    ],
    visual: {
      kind: "system",
      alt: "Technical route map for real-time flight orchestration",
      caption: "Event routing and state sync",
    },
    projectCodeTone: "ember",
    proof: {
      problem:
        "Simulation-heavy workflows needed predictable coordination under thousands of concurrent events.",
      role:
        "Designed the event flow, service boundaries, cache strategy, and real-time communication layer.",
      shipped:
        "Concurrent simulation paths, socket updates, Redis-backed state, and serverless execution patterns.",
      value:
        "Signals comfort with latency-sensitive systems where reliability is part of the product experience.",
    },
  },
  {
    id: "03",
    eyebrow: "Data Platform",
    title: "Cloud Data Pipeline",
    claim: "Telemetry in. Warehouse-ready signal out.",
    summary:
      "A serverless pipeline pattern for telemetry processing, elastic scale, and warehouse-ready outputs.",
    tags: ["AWS Glue", "S3", "Python", "Redshift"],
    icon: "cloud",
    accent: "peach",
    note: "Featured proof - cloud data movement.",
    proofBeats: [
      {
        label: "Problem",
        short: "Raw telemetry needed a repeatable path to decisions.",
        detail:
          "Large data streams needed a clean route from raw events to queryable business data.",
      },
      {
        label: "My Role",
        short: "Mapped ingestion, transforms, storage, and warehouse handoff.",
        detail:
          "Designed cloud-native boundaries across S3, Glue, Python processing, and Redshift.",
      },
      {
        label: "Shipped",
        short: "Landing zones, transforms, and warehouse-ready outputs.",
        detail:
          "Shipped a serverless pipeline shape for elastic data movement and retrieval.",
      },
      {
        label: "Impact",
        short: "Cleaner data, faster retrieval, elastic spend.",
        detail:
          "Frames infrastructure work as business leverage instead of hidden plumbing.",
      },
    ],
    visual: {
      kind: "system",
      alt: "Cloud data pipeline diagram with ingestion, transform, and warehouse nodes",
      caption: "Serverless data movement",
    },
    projectCodeTone: "lime",
    proof: {
      problem:
        "Large telemetry streams needed a repeatable path from raw events to queryable business data.",
      role:
        "Mapped ingestion, transformation, storage, and warehouse handoff with cloud-native constraints.",
      shipped:
        "S3 landing zones, Glue transforms, Python processing, and Redshift-ready output architecture.",
      value:
        "Frames infrastructure work as business leverage: cleaner data, faster retrieval, and elastic spend.",
    },
  },
  {
    id: "04",
    eyebrow: "Design System",
    title: "AI Portfolio Engine",
    claim: "The portfolio is a product, not a poster.",
    summary:
      "This portfolio itself: a motion-led interface system built to connect engineering rigor with editorial presence.",
    tags: ["React", "Motion", "LLM", "Design Systems"],
    icon: "sparkles",
    accent: "sand",
    note: "Featured proof - the site is also a product artifact.",
    proofBeats: [
      {
        label: "Problem",
        short: "Craft had to prove taste without hiding substance.",
        detail:
          "The portfolio needed to feel cinematic while keeping the proof easy to scan.",
      },
      {
        label: "My Role",
        short: "Directed structure, motion, hierarchy, and production fixes.",
        detail:
          "Shaped the system across content order, visual language, interaction behavior, and QA.",
      },
      {
        label: "Shipped",
        short: "Dark precision system with accessible motion fallbacks.",
        detail:
          "Shipped sticky project storytelling, responsive sections, and reduced-motion support.",
      },
      {
        label: "Impact",
        short: "The judged artifact demonstrates the craft directly.",
        detail:
          "Shows taste and implementation discipline in the same surface a visitor evaluates.",
      },
    ],
    visual: {
      kind: "type",
      alt: "Type-led portfolio system panel with motion and proof signals",
      caption: "Motion system as proof",
    },
    projectCodeTone: "split",
    proof: {
      problem:
        "The portfolio needed to feel crafted without hiding the practical proof hiring managers look for.",
      role:
        "Directed structure, motion pacing, interaction behavior, content hierarchy, and production fixes.",
      shipped:
        "Dark precision visual system, sticky project storytelling, responsive sections, and reduced-motion support.",
      value:
        "Demonstrates taste and implementation discipline inside the same artifact a visitor is judging.",
    },
  },
];
