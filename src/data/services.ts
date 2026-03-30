import type { Service } from "@/types";

// =============================================================================
// Services Data — Displayed in Landing Page Frame 3 (Services + Credibility)
// Edit this file to update service offerings on the landing page.
// =============================================================================

export const services: Service[] = [
  {
    id: "architecture",
    title: "Systems Architecture",
    description:
      "Designing distributed, fault-tolerant systems that scale. From microservices orchestration to event-driven pipelines, building the invisible infrastructure that powers products.",
    icon: "cpu",
    tags: ["AWS", "Microservices", "Event-Driven"],
  },
  {
    id: "cloud",
    title: "Cloud Engineering",
    description:
      "Building serverless pipelines and cloud-native platforms on AWS. Infrastructure as code, CI/CD automation, and elastic scaling for data-intensive workloads.",
    icon: "cloud",
    tags: ["AWS", "Terraform", "CI/CD"],
  },
  {
    id: "fullstack",
    title: "Full-Stack Development",
    description:
      "End-to-end application development with modern frameworks. From interactive frontends to robust APIs, bridging design intent with engineering precision.",
    icon: "terminal",
    tags: ["React", "Node.js", "TypeScript"],
  },
];
