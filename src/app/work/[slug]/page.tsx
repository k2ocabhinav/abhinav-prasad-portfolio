import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContactRail from "@/components/layout/ContactRail";
import ProjectDetailPage from "@/components/sections/ProjectDetailPage";
import {
  getAllPortfolioProjects,
  getChronicleEntries,
  getProjectDetailSlugs,
  getProfileContent,
} from "@/lib/portfolioContent";
import { absoluteUrl } from "@/lib/siteConfig";
import { buildProjectJsonLd, projectSeoTitle, serializeJsonLd } from "@/lib/structuredData";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getAllPortfolioProjects().find(
    (entry) => entry.status === "published" && entry.detail?.slug === slug,
  );
  const detail = project?.detail;

  if (!detail) {
    return {};
  }

  const title = projectSeoTitle(detail);
  const description = detail.seoDescription;
  const imageUrl = absoluteUrl(detail.heroImage.src);
  const canonicalUrl = absoluteUrl(`/work/${detail.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 1440,
          height: 900,
          alt: detail.heroImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: imageUrl, alt: detail.heroImage.alt }],
    },
  };
}

export function generateStaticParams() {
  return getProjectDetailSlugs().map((slug) => ({ slug }));
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;

  const project = getAllPortfolioProjects().find(
    (entry) => entry.status === "published" && entry.detail?.slug === slug,
  );
  const detail = project?.detail;
  if (!detail || !project) {
    notFound();
  }

  const profile = getProfileContent();
  const structuredData = buildProjectJsonLd(detail, profile, getChronicleEntries());

  return (
    <>
      <script id="project-structured-data" type="application/ld+json">
        {serializeJsonLd(structuredData)}
      </script>
      <ProjectDetailPage
        detail={detail}
        personal={profile.personal}
      />
      <ContactRail
        resumeHref={profile.personal.resumeHref}
        email={profile.personal.email}
        linkedinHref={
          profile.personal.socials.find(
            (social) => social.platform === "linkedin"
          )?.href
        }
        fullName={profile.personal.fullName}
      />
    </>
  );
}
