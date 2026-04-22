import type { ComponentType } from "react";
import type { BeyondPostMeta } from "@/types";
import { sortBeyondPostsByDate } from "@/lib/beyondTerminal";
import CarryOnSystems, {
  metadata as carryOnSystemsMetadata,
} from "./packing-systems-into-a-carry-on.mdx";
import MidnightPlatformPeople, {
  metadata as midnightPlatformPeopleMetadata,
} from "./midnight-platform-people.mdx";
import TrainingForQuietJudgment, {
  metadata as trainingForQuietJudgmentMetadata,
} from "./training-for-quiet-judgment.mdx";

interface BeyondJournalEntry {
  Component: ComponentType<Record<string, unknown>>;
  metadata: BeyondPostMeta;
}

const journalEntries: BeyondJournalEntry[] = [
  {
    Component: CarryOnSystems,
    metadata: carryOnSystemsMetadata,
  },
  {
    Component: MidnightPlatformPeople,
    metadata: midnightPlatformPeopleMetadata,
  },
  {
    Component: TrainingForQuietJudgment,
    metadata: trainingForQuietJudgmentMetadata,
  },
];

export function getAllBeyondPosts(): BeyondPostMeta[] {
  return sortBeyondPostsByDate(journalEntries.map((entry) => entry.metadata));
}

export function getFeaturedBeyondPosts(): BeyondPostMeta[] {
  return getAllBeyondPosts()
    .filter((post) => post.featured)
    .slice(0, 3);
}

export function getBeyondPostBySlug(slug: string): BeyondJournalEntry | null {
  return journalEntries.find((entry) => entry.metadata.slug === slug) ?? null;
}
