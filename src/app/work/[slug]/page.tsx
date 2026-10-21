import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContactRail from "@/components/layout/ContactRail";
import ProjectDetailPage from "@/components/sections/ProjectDetailPage";
import {
  getChronicleEntries,
  getProjectDetailSlugs,
  getProfileContent,
  getPublishedProjects,
} from "@/lib/portfolioContent";
import { absoluteUrl } from "@/lib/siteConfig";
import { buildProjectJsonLd, projectSeoTitle, serializeJsonLd } from "@/lib/structuredData";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getPublishedProjects().find(
    (entry) => entry.status === "published" && entry.detail?.slug === slug,
  );
  const detail = project?.detail;

  if (!detail) {
    return {};
  }

  const title = projectSeoTitle(detail);
  const description = detail.seoDescription;
  const shareImage = detail.ogImage ?? detail.heroImage;
  const imageUrl = absoluteUrl(shareImage.src);
  const canonicalUrl = absoluteUrl(`/work/${detail.slug}`);
  const openGraphImage = {
    url: imageUrl,
    alt: shareImage.alt,
    ...(detail.ogImage
      ? { width: detail.ogImage.width, height: detail.ogImage.height }
      : {}),
  };

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
      images: [openGraphImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: imageUrl, alt: shareImage.alt }],
    },
  };
}

export function generateStaticParams() {
  return getProjectDetailSlugs().map((slug) => ({ slug }));
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;

  const project = getPublishedProjects().find(
    (entry) => entry.status === "published" && entry.detail?.slug === slug,
  );
  const detail = project?.detail;
  if (!detail || !project) {
    notFound();
  }

  const profile = getProfileContent();
  const orderedDetails = getPublishedProjects().flatMap((entry) =>
    entry.detail ? [{ slug: entry.detail.slug, title: entry.detail.title }] : []
  );
  const currentIndex = orderedDetails.findIndex((entry) => entry.slug === detail.slug);
  const nextCaseStudy = orderedDetails.length > 1 && currentIndex >= 0
    ? orderedDetails[(currentIndex + 1) % orderedDetails.length]
    : undefined;
  const structuredData = buildProjectJsonLd(detail, profile, getChronicleEntries());

  return (
    <>
      <script id="project-structured-data" type="application/ld+json">
        {serializeJsonLd(structuredData)}
      </script>
      <ProjectDetailPage
        detail={detail}
        personal={profile.personal}
        nextCaseStudy={nextCaseStudy}
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
