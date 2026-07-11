import "server-only";

import type { getHomeContent } from "@/lib/portfolioContent";
import { absoluteUrl } from "@/lib/siteConfig";

type HomeContent = ReturnType<typeof getHomeContent>;
type JsonLdNode = Record<string, unknown>;

export interface PortfolioJsonLd {
  "@context": "https://schema.org";
  "@graph": JsonLdNode[];
}

export function buildPortfolioJsonLd(content: HomeContent): PortfolioJsonLd {
  const { profile, chronicleEntries, projects } = content;
  const { personal } = profile;
  const websiteId = `${absoluteUrl("/")}#website`;
  const profilePageId = `${absoluteUrl("/")}#profile-page`;
  const personId = `${absoluteUrl("/")}#person`;
  const primaryExperience = chronicleEntries[0];
  const currentRole = primaryExperience?.roles[0];
  const sameAs = personal.socials
    .filter((social) => social.platform !== "email" && social.href.startsWith("https://"))
    .map((social) => social.href);

  const person: JsonLdNode = {
    "@type": "Person",
    "@id": personId,
    name: personal.fullName,
    url: absoluteUrl("/"),
    description: personal.subtitle,
    jobTitle: currentRole?.title ?? personal.title,
    homeLocation: {
      "@type": "Place",
      name: `${personal.location.city}, ${personal.location.country}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: personal.location.city,
        addressCountry: personal.location.countryCode,
      },
    },
    sameAs,
    knowsAbout: profile.knowsAbout,
  };

  if (primaryExperience) {
    person.worksFor = {
      "@type": "Organization",
      name: primaryExperience.company,
      description: primaryExperience.companyContext,
    };
    person.hasOccupation = {
      "@type": "Occupation",
      name: currentRole?.title ?? "Software Engineer",
      description: primaryExperience.backendThesis,
      occupationLocation: {
        "@type": "Country",
        name: personal.location.country,
      },
    };
  }

  const publicWorks = projects
    .filter((project) => project.detail)
    .slice(0, 2)
    .map((project): JsonLdNode => {
      const projectUrl = absoluteUrl(`/work/${project.detail!.slug}`);
      const repository = project.links?.find(
        (link) => link.href?.startsWith("https://github.com/")
      )?.href;

      return {
        "@type": "SoftwareSourceCode",
        "@id": `${projectUrl}#software-source-code`,
        name: project.title,
        description: project.description,
        url: projectUrl,
        creator: { "@id": personId },
        isPartOf: { "@id": websiteId },
        keywords: project.tags,
        ...(repository ? { codeRepository: repository } : {}),
      };
    });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: absoluteUrl("/"),
        name: `${personal.fullName} — Engineering Portfolio`,
        description: profile.seo?.description ?? personal.subtitle,
        inLanguage: "en",
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": profilePageId,
        url: absoluteUrl("/"),
        name: profile.seo?.title ?? `${personal.fullName} — Engineering Portfolio`,
        description: profile.seo?.description ?? personal.subtitle,
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": personId },
        inLanguage: "en",
      },
      person,
      ...publicWorks,
    ],
  };
}

export function serializeJsonLd(value: PortfolioJsonLd): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
