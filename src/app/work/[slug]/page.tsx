import { notFound } from "next/navigation";
import ProjectDetailPage from "@/components/sections/ProjectDetailPage";
import {
  isProjectDetailSlug,
  projectDetails,
  projectDetailSlugs,
} from "@/data/projectDetails";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projectDetailSlugs.map((slug) => ({ slug }));
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;

  if (!isProjectDetailSlug(slug)) {
    notFound();
  }

  const detail = projectDetails[slug];
  if (!detail) {
    notFound();
  }

  return <ProjectDetailPage detail={detail} />;
}
