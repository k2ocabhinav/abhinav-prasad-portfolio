import type { ProjectDetail } from "@/types";

export const projectDetailSlugs = ["velo"] as const;

export type ProjectDetailSlug = (typeof projectDetailSlugs)[number];

export const projectDetails: Record<ProjectDetailSlug, ProjectDetail> = {
  velo: {
    slug: "velo",
    eyebrow: "Flagship Build",
    title: "Velo — White-Label Dispatch Platform",
    subtitle:
      "A branding-first dispatch engine for mobility and logistics, with tenant-specific rider, driver, and admin experiences over a shared real-time core.",
    scopeSummary:
      "End-to-end ownership across platform architecture, multi-portal frontend systems, reliability controls, and security-focused delivery workflows.",
    heroImage: {
      src: "/projects/velo/01-landing-hero.png",
      alt: "Velo landing page hero with branding-first visual direction",
      caption: "Landing-first identity for the platform brand.",
    },
    gallery: [
      {
        src: "/projects/velo/01-landing-hero.png",
        alt: "Velo landing page hero with branding-first visual direction",
        caption: "Brand-led landing surface.",
      },
      {
        src: "/projects/velo/02-admin-dispatch.png",
        alt: "Velo admin dispatch console showing queue and assignment operations",
        caption: "Dispatch operations and audit-aware controls.",
      },
      {
        src: "/projects/velo/03-rider-live-trip.png",
        alt: "Velo rider active trip flow with live state and map context",
        caption: "Live trip continuity for riders.",
      },
      {
        src: "/projects/velo/04-admin-dashboard.png",
        alt: "Velo admin dashboard with operational metrics and status cards",
        caption: "Operational dashboard and health visibility.",
      },
      {
        src: "/projects/velo/05-rider-booking-map.png",
        alt: "Velo rider booking map with route preview and fare estimate controls",
        caption: "Map-first booking flow and fare preview.",
      },
      {
        src: "/projects/velo/06-driver-ride-control.png",
        alt: "Velo driver ride control page with lifecycle actions and map",
        caption: "Driver ride control from OTP to completion.",
      },
    ],
    architectureSections: [
      {
        title: "Tenant-Aware Domain Isolation",
        description:
          "Each request and domain flow is tenant-scoped so branded operations can share core infrastructure without cross-tenant leakage.",
        points: [
          "Tenant-bound entity model and repository queries for rider, driver, ride, payment, and notifications.",
          "Tenant configuration surface for branding and dispatch mode behavior.",
          "Cross-tenant access checks on ride and dispatch workflows.",
        ],
      },
      {
        title: "Real-Time Dispatch Engine",
        description:
          "Dispatch behavior is modeled as composable strategy and event pipelines to keep matching, fare logic, and lifecycle communication deterministic.",
        points: [
          "Strategy-based fare, driver matching, and payment handling with runtime selection.",
          "Race-safe request claiming via compare-and-set transitions plus optimistic locking safeguards.",
          "Event-driven notifications and STOMP/SockJS realtime delivery to rider and driver clients.",
        ],
      },
      {
        title: "Reliability + Delivery Discipline",
        description:
          "Platform quality is enforced through layered tests, reproducible integration harnesses, and security checks integrated into CI.",
        points: [
          "Backend unit/integration coverage with tenant and lifecycle regression focus.",
          "Frontend unit, contract, and Playwright smoke coverage across admin/rider/driver apps.",
          "Security and dependency gates with OWASP dependency-check and npm audit in workflow pipelines.",
        ],
      },
    ],
    stackBuckets: [
      {
        label: "Backend Platform",
        items: [
          "Java 22",
          "Spring Boot 3.5",
          "Spring Security",
          "Spring WebSocket (STOMP/SockJS)",
          "JJWT",
          "ModelMapper",
          "Lombok",
        ],
      },
      {
        label: "Data + Geospatial",
        items: [
          "PostgreSQL",
          "PostGIS",
          "Hibernate Spatial",
          "Flyway",
          "Redis",
          "OSRM",
        ],
      },
      {
        label: "Frontend Platform",
        items: [
          "Next.js App Router",
          "React 19",
          "TypeScript 5",
          "Turborepo",
          "motion/react",
          "Leaflet + React-Leaflet",
        ],
      },
      {
        label: "Quality + Delivery",
        items: [
          "JUnit + Spring Integration",
          "Vitest",
          "Playwright",
          "GitHub Actions",
          "Docker Compose",
          "OWASP Dependency-Check",
        ],
      },
    ],
    qualityHighlights: [
      "Deterministic contract boundaries via BFF proxy routes and consistent response unwrapping.",
      "Dispatch lifecycle integrity through idempotent earnings settlement and migration-backed repair paths.",
      "Operational transparency from dashboard health counters, queue depth visibility, and audit trail events.",
    ],
    references: [
      { label: "Source", href: null },
      { label: "Architecture", href: null },
      { label: "API Docs", href: "http://localhost:8080/swagger-ui/index.html" },
    ],
  },
};

export function isProjectDetailSlug(slug: string): slug is ProjectDetailSlug {
  return projectDetailSlugs.includes(slug as ProjectDetailSlug);
}
