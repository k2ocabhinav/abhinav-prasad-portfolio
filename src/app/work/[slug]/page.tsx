import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetailPage from "@/components/sections/ProjectDetailPage";
import {
  getProjectDetailBySlug,
  getProjectDetailSlugs,
  getProfileContent,
} from "@/lib/portfolioContent";
import { absoluteUrl } from "@/lib/siteConfig";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = getProjectDetailBySlug(slug);

  if (!detail) {
    return {};
  }

  const title = detail.title;
  const imageUrl = absoluteUrl(detail.heroImage.src);
  const canonicalUrl = absoluteUrl(`/work/${detail.slug}`);

  return {
    title,
    description: detail.subtitle,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      title,
      description: detail.subtitle,
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
      description: detail.subtitle,
      images: [imageUrl],
    },
  };
}

export function generateStaticParams() {
  return getProjectDetailSlugs().map((slug) => ({ slug }));
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;

  const detail = getProjectDetailBySlug(slug);
  if (!detail) {
    notFound();
  }

  return <ProjectDetailPage detail={detail} personal={getProfileContent().personal} />;
}
