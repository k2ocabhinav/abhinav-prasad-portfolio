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
