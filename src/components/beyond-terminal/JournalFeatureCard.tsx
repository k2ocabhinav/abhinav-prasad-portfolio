import Link from "next/link";
import { formatBeyondDate } from "@/lib/beyondTerminal";
import type { BeyondCard, BeyondPostMeta } from "@/types";
import BeyondSymbolFrame from "./BeyondSymbolFrame";
import styles from "./JournalFeatureCard.module.css";

interface JournalFeatureCardProps {
  card: BeyondCard;
  post: BeyondPostMeta;
}

export default function JournalFeatureCard({
  card,
  post,
}: JournalFeatureCardProps) {
  return (
    <article
      className={styles.card}
      data-beyond-reveal
      data-beyond-band
      data-accent={card.accent}
      data-layout={card.layout}
    >
      <div className={styles.copy} data-card-copy>
        <span className={styles.eyebrow}>{card.eyebrow}</span>
        <h3 className={styles.title}>{card.title}</h3>
        <p className={styles.deck}>{card.deck}</p>

        <div className={styles.postMeta}>
          <span>{formatBeyondDate(post.publishedAt)}</span>
          <span>{post.readingTime}</span>
        </div>

        <div className={styles.postCopy}>
          <h4>{post.title}</h4>
          <p>{post.excerpt}</p>
        </div>

        <div className={styles.actions}>
          <Link href={`/beyond-terminal/journal/${post.slug}`} className={styles.primaryAction}>
            Read featured note
          </Link>
          <Link href="/beyond-terminal/journal" className={styles.secondaryAction}>
            Browse archive
          </Link>
        </div>
      </div>

      <div className={styles.visual} data-card-media>
        <BeyondSymbolFrame
          media={post.cover}
          symbol={card.symbol}
          label={`${post.tags.slice(0, 2).join(" / ")} / local mdx`}
        />
      </div>
    </article>
  );
}
