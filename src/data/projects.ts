import type { Project } from "@/types";

// =============================================================================
// Projects Data — Add/remove/reorder entries to update the Works section
// =============================================================================

export const projects: Project[] = [
  {
    id: "01",
    title: "Flight Management System",
    description:
      "A real-time orchestration engine handling 10k+ concurrent flight simulations. Built for sub-millisecond latency.",
    icon: "terminal",
    tags: ["AWS Lambda", "Go", "Redis", "WebSockets"],
    caseStudySlug: null,
  },
  {
    id: "02",
    title: "Cloud Data Pipeline",
    description:
      "Serverless architecture processing TBs of daily telemetry data. Integrated for elastic scalability.",
    icon: "cloud",
    tags: ["AWS Glue", "S3", "Python", "Redshift"],
    caseStudySlug: null,
    reversed: true,
  },
  {
    id: "03",
    title: "BI Dashboard Suite",
    description:
      "Enterprise-level visualization tool for executive decision making. Optimized query engines for instant retrieval.",
    icon: "database",
    tags: ["Power BI", "MySQL", "DAX", "REST API"],
    caseStudySlug: null,
  },
  {
    id: "04",
    title: "AI Portfolio Engine",
    description:
      "This portfolio itself — a generative design system powered by AI. Explores the intersection of engineering rigour and editorial aesthetics.",
    icon: "sparkles",
    tags: ["React", "Framer Motion", "LLM", "Design Systems"],
    caseStudySlug: null,
    reversed: true,
  },
];
