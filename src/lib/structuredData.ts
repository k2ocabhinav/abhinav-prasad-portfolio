import "server-only";

import type {
  ChronicleEntry,
  PortfolioProfile,
  ProjectDetail,
} from "@/types";
import { absoluteUrl } from "@/lib/siteConfig";

type JsonLdNode = Record<string, unknown>;

export interface PortfolioJsonLd {
  "@context": "https://schema.org";
  "@graph": JsonLdNode[];
}

function buildPersonNode(
  profile: PortfolioProfile,
  chronicleEntries: ChronicleEntry[],
  personId: string
): JsonLdNode {
  const { personal } = profile;
  const primaryExperience = chronicleEntries[0];
  const currentRole = primaryExperience?.roleTitle;

  const person: JsonLdNode = {
    "@type": "Person",
    "@id": personId,
    name: personal.fullName,
    url: absoluteUrl("/"),
    description: personal.subtitle,
    jobTitle: currentRole ?? personal.title,
    homeLocation: {
      "@type": "Place",
      name: `${personal.location.city}, ${personal.location.country}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: personal.location.city,
        addressCountry: personal.location.countryCode,
      },
    },
    sameAs: personal.socials
      .filter((social) => social.platform !== "email" && social.href.startsWith("https://"))
      .map((social) => social.href),
    knowsAbout: profile.knowsAbout,
  };

  if (primaryExperience) {
    person.worksFor = {
      "@type": "Organization",
      name: primaryExperience.company,
    };
    person.hasOccupation = {
      "@type": "Occupation",
      name: currentRole ?? "Software Engineer",
      description: primaryExperience.roleScope,
      occupationLocation: {
        "@type": "Country",
        name: personal.location.country,
      },
    };
  }

  return person;
}

export function buildPortfolioJsonLd(
  profile: PortfolioProfile,
  chronicleEntries: ChronicleEntry[]
): PortfolioJsonLd {
  const { personal } = profile;
  const websiteId = `${absoluteUrl("/")}#website`;
  const profilePageId = `${absoluteUrl("/")}#profile-page`;
  const personId = `${absoluteUrl("/")}#person`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: absoluteUrl("/"),
        name: `${personal.fullName}'s engineering portfolio`,
        description: profile.seo.description,
        inLanguage: "en",
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": profilePageId,
        url: absoluteUrl("/"),
        name: profile.seo.title,
        description: profile.seo.description,
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": personId },
        inLanguage: "en",
      },
      buildPersonNode(profile, chronicleEntries, personId),
    ],
  };
}

export function buildProjectJsonLd(
  detail: ProjectDetail,
  profile: PortfolioProfile,
  chronicleEntries: ChronicleEntry[]
): PortfolioJsonLd {
  const homeUrl = absoluteUrl("/");
  const websiteId = `${homeUrl}#website`;
  const personId = `${homeUrl}#person`;
  const pageUrl = absoluteUrl(`/work/${detail.slug}`);
  const pageId = `${pageUrl}#webpage`;
  const projectId = `${pageUrl}#project`;
  const referencedRepository = detail.references?.find(
    (reference) =>
      reference.href?.startsWith("https://github.com/")
  )?.href;
  const repository = referencedRepository;
  const project: JsonLdNode = {
    "@type": repository ? ["CreativeWork", "SoftwareSourceCode"] : "CreativeWork",
    "@id": projectId,
    name: projectSeoTitle(detail),
    description: detail.subtitle,
    url: pageUrl,
    image: absoluteUrl(detail.heroImage.src),
    keywords: detail.stackBuckets.flatMap((bucket) => bucket.items),
    creator: { "@id": personId },
    isPartOf: { "@id": websiteId },
    mainEntityOfPage: { "@id": pageId },
    ...(repository ? { codeRepository: repository } : {}),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: homeUrl,
        name: `${profile.personal.fullName}'s engineering portfolio`,
        publisher: { "@id": personId },
      },
      buildPersonNode(profile, chronicleEntries, personId),
      {
        "@type": "WebPage",
        "@id": pageId,
        url: pageUrl,
        name: projectSeoTitle(detail),
        description: detail.subtitle,
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": projectId },
      },
      project,
    ],
  };
}

export function projectSeoTitle(detail: ProjectDetail): string {
  return detail.seoTitle;
}

export function serializeJsonLd(value: PortfolioJsonLd): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
