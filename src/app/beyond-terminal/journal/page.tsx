import type { Metadata } from "next";
import FieldNoteCard from "@/components/beyond-terminal/FieldNoteCard";
import JournalFeatureCard from "@/components/beyond-terminal/JournalFeatureCard";
import { beyondActs, beyondArchiveIntro } from "@/data/beyondTerminal";
import { getAllBeyondPosts } from "@/content/beyond-terminal/journal";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Archive of local MDX notes from Beyond The Terminal: travel, books, training, and field observations.",
};

export default function BeyondJournalArchivePage() {
  const posts = getAllBeyondPosts();
  const [leadPost, ...restPosts] = posts;
  const journalCard = beyondActs[2]?.cards[0];

  return (
    <section className={styles.archive}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>{beyondArchiveIntro.eyebrow}</span>
        <h1 className={styles.title}>{beyondArchiveIntro.title}</h1>
        <p className={styles.deck}>{beyondArchiveIntro.deck}</p>
      </header>

      {leadPost && journalCard ? (
        <JournalFeatureCard card={journalCard} post={leadPost} />
      ) : null}

      <div className={styles.grid}>
        {restPosts.map((post) => (
          <FieldNoteCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
