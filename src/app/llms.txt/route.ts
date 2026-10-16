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
  const currentRole = experience?.roles[0]?.title ?? profile.personal.title;
  const experienceSummary = experience
    ? `${currentRole} at ${experience.company} (${experience.period}). ${experience.backendThesis} ${experience.functionality}`
    : "Professional experience is available on the portfolio homepage.";

  const lines = [
    `# ${profile.personal.fullName}`,
    "",
    `> ${profile.seo?.description ?? profile.personal.subtitle}`,
    "",
    "## Positioning",
    "",
    profile.personal.title,
    profile.personal.subtitle,
    `Currently: ${currentRole} at ${experience?.company ?? "the current employer"}.`,
    profile.personal.presenceDescription,
    "",
    "## Professional experience",
    "",
    experienceSummary,
    "",
    "## Selected work",
    "",
    ...projects.map(({ project, detail }) => {
      const linkedSource = project.links?.find((link) =>
        link.href?.startsWith("https://github.com/")
      )?.href;
      const source = linkedSource ?? (detail.slug === "portfolio-platform"
        ? "https://github.com/k2ocabhinav/abhinav-prasad-portfolio"
        : undefined);
      const sourceNote = source ? ` Source: [GitHub](${source}).` : "";
      return `- [${projectSeoTitle(detail)}](${absoluteUrl(`/work/${detail.slug}`)}): ${project.description} Stack: ${project.tags.join(", ")}.${sourceNote}`;
    }),
    "",
    "## Contact",
    "",
    `- [Email](mailto:${profile.personal.email})`,
    ...profile.personal.socials
      .filter((social) => social.href.startsWith("https://"))
      .map((social) => `- [${social.label}](${social.href})`),
    "",
    "## Optional",
    "",
    `- [Resume](${absoluteUrl(profile.personal.resumeHref)})`,
    `- [Portfolio homepage](${absoluteUrl("/")})`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
