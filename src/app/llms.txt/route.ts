import {
  getChronicleEntries,
  getProfileContent,
  getPublishedProjects,
} from "@/lib/portfolioContent";
import { absoluteUrl } from "@/lib/siteConfig";
import { projectSeoTitle } from "@/lib/structuredData";

export const dynamic = "force-static";

export function GET() {
  const profile = getProfileContent();
  const experience = getChronicleEntries()[0];
  const projects = getPublishedProjects().flatMap((project) =>
    project.detail ? [{ project, detail: project.detail }] : []
  );
  const currentRole = experience?.roleTitle ?? profile.personal.title;
  const experienceSummary = experience
    ? `${currentRole} at ${experience.company} (${experience.period}). ${experience.employmentNote} ${experience.roleScope}`
    : "Professional experience is available on the portfolio homepage.";

  const lines = [
    `# ${profile.personal.fullName}`,
    "",
    `> ${profile.seo.description}`,
    "",
    profile.personal.title,
    profile.personal.subtitle,
    `At work: ${currentRole}, ${experience?.company ?? "the current employer"}.`,
    ...profile.llms.positioningLines,
    profile.personal.presenceDescription,
    ...profile.llms.homepageLines,
    experienceSummary,
    "",
    "## Homepage",
    "",
    `- [Homepage](${absoluteUrl("/")}): ${profile.seo.description}`,
    `- [Selected work](${absoluteUrl("/#work")}): Project cards and the method behind them.`,
    "",
    "## Professional experience",
    "",
    `- [Experience](${absoluteUrl("/#experience")}): ${experienceSummary}`,
    "",
    "## Selected work",
    "",
    ...projects.flatMap(({ project, detail }) => {
      const linkedSource = project.links?.find((link) =>
        link.href?.startsWith("https://github.com/")
      )?.href;
      const detailSource = detail.references?.find((link) =>
        link.href?.startsWith("https://github.com/")
      )?.href;
      const source = linkedSource ?? detailSource;
      const sourceNote = source ? ` Source: [GitHub](${source}).` : "";
      const projectUrl = absoluteUrl(`/work/${detail.slug}`);
      const markdownUrl = absoluteUrl(`/work/${detail.slug}.md`);
      return [
        `- [${projectSeoTitle(detail)}](${projectUrl}): ${project.description} Stack: ${project.tags.join(", ")}.${sourceNote}`,
        `- [${projectSeoTitle(detail)} as Markdown](${markdownUrl}): Full case-study text generated from the same project content.`,
      ];
    }),
    "",
    "## Contact",
    "",
    `- [Email](mailto:${profile.personal.email})`,
    ...profile.personal.socials
      .filter((social) => social.href.startsWith("https://"))
      .map((social) => `- [${social.label}](${social.href}): ${social.label} profile.`),
    "",
    "## Optional",
    "",
    `- [Résumé](${absoluteUrl(profile.personal.resumeHref)}): Download the résumé.`,
    `- [Portfolio homepage](${absoluteUrl("/")}): Return to the homepage.`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
