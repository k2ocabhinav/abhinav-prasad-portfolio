import Link from "next/link";
import { formatBeyondDate } from "@/lib/beyondTerminal";
import type { BeyondPostMeta } from "@/types";
import BeyondSymbolFrame from "./BeyondSymbolFrame";
import styles from "./FieldNoteCard.module.css";

interface FieldNoteCardProps {
  post: BeyondPostMeta;
}

export default function FieldNoteCard({ post }: FieldNoteCardProps) {
  return (
    <Link
      href={`/beyond-terminal/journal/${post.slug}`}
      className={styles.card}
      data-beyond-reveal
      data-beyond-band
      data-display-size={post.displaySize ?? "secondary"}
    >
      <div className={styles.visual} data-card-media>
        <BeyondSymbolFrame
          media={post.cover}
          label={`${formatBeyondDate(post.publishedAt)} / ${post.readingTime}`}
          className={styles.frame}
        />
      </div>
      <div className={styles.copy} data-card-copy>
        <div className={styles.meta}>{post.tags.join(" / ")}</div>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <div className={styles.tags}>
          {post.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
