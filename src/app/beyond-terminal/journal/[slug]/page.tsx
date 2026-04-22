import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleCardShell from "@/components/beyond-terminal/ArticleCardShell";
import {
  getAllBeyondPosts,
  getBeyondPostBySlug,
} from "@/content/beyond-terminal/journal";

interface BeyondJournalArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BeyondJournalArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBeyondPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.metadata.title,
    description: post.metadata.excerpt,
  };
}

export function generateStaticParams() {
  return getAllBeyondPosts().map((post) => ({
    slug: post.slug,
  }));
}

export default async function BeyondJournalArticlePage({
  params,
}: BeyondJournalArticlePageProps) {
  const { slug } = await params;
  const post = getBeyondPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const Article = post.Component;

  return (
    <ArticleCardShell post={post.metadata}>
      <Article />
    </ArticleCardShell>
  );
}
