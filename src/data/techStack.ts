import type { TechCategory } from "@/types";

// =============================================================================
// Tech Stack Data - categories shown in the Stack section
// =============================================================================

export const techCategories: TechCategory[] = [
  {
    icon: "cloud",
    label: "Cloud Infrastructure",
    content: "AWS EC2, RDS, Bedrock, IAM, S3",
  },
  {
    icon: "database",
    label: "Data Systems",
    content: "MySQL, Workbench, Stored Procedures",
  },
  {
    icon: "terminal",
    label: "Development Tools",
    content: "Git, GitHub, VS Code, Bash, REST APIs",
  },
  {
    icon: "sparkles",
    label: "Artificial Intelligence",
    content: "Claude AI, LLM Integration, Bedrock",
  },
];
