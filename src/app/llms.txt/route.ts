import {
  getChronicleEntries,
  getProfileContent,
  getPublishedProjects,
} from "@/lib/portfolioContent";
import { absoluteUrl } from "@/lib/siteConfig";

export const dynamic = "force-static";

export function GET() {
  const profile = getProfileContent();
  const experience = getChronicleEntries()[0];
  const projects = getPublishedProjects().filter((project) => project.detail);

  const lines = [
    `# ${profile.personal.fullName}`,
    "",
    `> ${profile.seo?.description ?? profile.personal.subtitle}`,
    "",
    "## Profile",
    "",
    profile.personal.subtitle,
    "",
    "## Professional experience",
    "",
    experience
      ? `${experience.company}, ${experience.period}. ${experience.backendThesis}`
      : "Professional experience is available on the portfolio homepage.",
    "",
    "## Selected work",
    "",
    ...projects.map(
      (project) =>
        `- [${project.title}](${absoluteUrl(`/work/${project.detail!.slug}`)}): ${project.description}`
    ),
    "",
    "## Primary links",
    "",
    `- [Portfolio](${absoluteUrl("/")})`,
    `- [Resume](${absoluteUrl(profile.personal.resumeHref)})`,
    ...profile.personal.socials
      .filter((social) => social.href.startsWith("https://"))
      .map((social) => `- [${social.label}](${social.href})`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
