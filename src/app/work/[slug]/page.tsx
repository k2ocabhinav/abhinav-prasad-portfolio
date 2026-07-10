import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetailPage from "@/components/sections/ProjectDetailPage";
import {
  getProfileContent,
  getProjectDetailBySlug,
  getProjectDetailSlugs,
} from "@/lib/portfolioContent";

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

  const seo = getProfileContent().seo;
  const title = `${detail.title} — Abhinav`;
  const imageUrl = seo
    ? new URL(detail.heroImage.src, seo.url).toString()
    : detail.heroImage.src;

  return {
    title,
    description: detail.subtitle,
    openGraph: {
      type: "website",
      title,
      description: detail.subtitle,
      url: seo ? new URL(`/work/${detail.slug}`, seo.url).toString() : undefined,
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
