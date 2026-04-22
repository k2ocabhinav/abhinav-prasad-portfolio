import { cn } from "@/lib/utils";
import type { BeyondCard } from "@/types";
import BeyondSymbolFrame from "./BeyondSymbolFrame";
import styles from "./SplitArtifactCard.module.css";

interface SplitArtifactCardProps {
  card: BeyondCard;
  reversed?: boolean;
}

export default function SplitArtifactCard({
  card,
  reversed = false,
}: SplitArtifactCardProps) {
  if (!card.media) {
    return null;
  }

  const isReversed = reversed || card.layout === "wide_strip_reverse";

  return (
    <article
      className={cn(styles.card, isReversed && styles.cardReversed)}
      data-beyond-reveal
      data-artifact-card
      data-beyond-band
      data-accent={card.accent}
      data-layout={card.layout}
    >
      <div className={styles.copy} data-card-copy>
        <span className={styles.eyebrow}>{card.eyebrow}</span>
        <h3 className={styles.title}>{card.title}</h3>
        <p className={styles.deck}>{card.deck}</p>

        <div className={styles.body}>
          {card.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {card.notes?.length ? (
          <dl className={styles.notes}>
            {card.notes.map((note) => (
              <div key={note.id} className={styles.note}>
                <dt>{note.label}</dt>
                <dd>{note.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      <div className={styles.visual} data-card-media>
        <BeyondSymbolFrame
          media={card.media}
          symbol={card.symbol}
          label="Wide artifact / aligned framed study"
        />
      </div>
    </article>
  );
}
