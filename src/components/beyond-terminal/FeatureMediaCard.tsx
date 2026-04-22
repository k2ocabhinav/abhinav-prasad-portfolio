import type { BeyondCard } from "@/types";
import BeyondSymbolFrame from "./BeyondSymbolFrame";
import styles from "./FeatureMediaCard.module.css";

interface FeatureMediaCardProps {
  card: BeyondCard;
}

export default function FeatureMediaCard({ card }: FeatureMediaCardProps) {
  if (!card.media) {
    return null;
  }

  return (
    <article
      className={styles.card}
      data-beyond-reveal
      data-signal-visual
      data-beyond-band
      data-accent={card.accent}
      data-layout={card.layout}
    >
      <div className={styles.copy} data-card-copy>
        <span className={styles.eyebrow}>{card.eyebrow}</span>
        <h3 className={styles.title}>{card.title}</h3>
        <p className={styles.deck}>{card.deck}</p>
      </div>

      <div className={styles.visual} data-card-media>
        <BeyondSymbolFrame
          media={card.media}
          symbol={card.symbol}
          label="Shared portal / pastel mist skin"
          priority
        />
      </div>

      {card.notes?.length ? (
        <ul className={styles.notes} aria-label="Feature notes">
          {card.notes.map((note) => (
            <li key={note.id}>{note.value}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
