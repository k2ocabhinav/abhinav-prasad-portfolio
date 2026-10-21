import "server-only";

import type { PortfolioProject, ProjectDetail } from "@/types";
import { getPublishedProjects } from "@/lib/portfolioContent";
import { absoluteUrl } from "@/lib/siteConfig";

function formatVisual(alt: string, src: string, caption: string) {
  return `- [${alt}](${absoluteUrl(src)}): ${caption}`;
}

function formatProjectMarkdown(project: PortfolioProject, detail: ProjectDetail) {
  const story = detail.storyboard;
  const facts = story?.facts.map((fact) => `- ${fact.label}: ${fact.value}`) ?? [];
  const tripSteps = story?.tripSteps.map(
    (step) => `- ${step.label}: ${step.summary}`
  ) ?? [];
  const chapters = story?.chapters.flatMap((chapter) => [
    `### ${chapter.title}`,
    chapter.summary,
    "",
  ]) ?? [];
  const proofLines = [
    story?.mobileProof
      ? `- ${story.mobileProof.title}: ${story.mobileProof.summary}`
      : null,
    story?.featureProof
      ? `- ${story.featureProof.title}: ${story.featureProof.summary}`
      : null,
    story?.scheduleProof ? `- ${story.scheduleProof.summary}` : null,
  ].filter((line): line is string => line !== null);
  const architecture = detail.architectureSections.flatMap((section) => [
    `### ${section.title}`,
    section.description,
    ...section.points.map((point) => `- ${point}`),
    "",
  ]);
  const stack = detail.stackBuckets.flatMap((bucket) => [
    `### ${bucket.label}`,
    ...bucket.items.map((item) => `- ${item}`),
    "",
  ]);
  const visuals = story?.visuals.map((visual) =>
    formatVisual(visual.alt, visual.src, visual.caption)
  ) ?? detail.gallery.map((visual) => formatVisual(visual.alt, visual.src, visual.caption));
  const references = detail.references?.flatMap((reference) =>
    reference.href ? [`- [${reference.label}](${reference.href})`] : []
  ) ?? [];

  const lines = [
    `# ${detail.title}`,
    "",
    `> ${detail.subtitle}`,
    "",
    detail.scopeSummary,
    ...(detail.roleLine && detail.roleLine !== detail.scopeSummary ? [detail.roleLine] : []),
    "",
    `![${detail.heroImage.alt}](${absoluteUrl(detail.heroImage.src)} "${detail.heroImage.caption}")`,
    "",
    "## Project details",
    `- ${project.description}`,
    ...(story?.status ? [`- Status: ${story.status}`] : []),
    ...facts,
    ...(detail.hardPart
      ? ["", `## ${detail.hardPart.label}`, "", detail.hardPart.copy]
      : []),
    ...(story
      ? [
          "",
          "## Product flow",
          `### ${story.tripIntro.title}`,
          ...(story.tripIntro.summary ? [story.tripIntro.summary] : []),
          ...tripSteps,
          "",
          ...chapters,
          ...proofLines,
        ]
      : []),
    "",
    "## Architecture",
    ...architecture,
    "## Stack",
    ...stack,
    ...(detail.qualityHighlights.length > 0
      ? ["## Quality checks", ...detail.qualityHighlights.map((item) => `- ${item}`), ""]
      : []),
    ...(visuals.length > 0 ? ["## Screens", ...visuals, ""] : []),
    ...(references.length > 0 ? ["## References", ...references, ""] : []),
  ];

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

export function getProjectMarkdownResponse(slug: string) {
  const project = getPublishedProjects().find(
    (entry) => entry.slug === slug && entry.detail?.slug === slug
  );

  if (!project?.detail) {
    return new Response("Not found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(formatProjectMarkdown(project, project.detail), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
