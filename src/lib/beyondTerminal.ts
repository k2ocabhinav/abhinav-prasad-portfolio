import type { BeyondPostMeta } from "@/types";

export function formatBeyondDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function sortBeyondPostsByDate(posts: BeyondPostMeta[]): BeyondPostMeta[] {
  return [...posts].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  );
}
