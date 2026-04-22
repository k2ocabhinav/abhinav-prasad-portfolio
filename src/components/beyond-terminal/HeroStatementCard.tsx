import Link from "next/link";
import type { BeyondCard } from "@/types";
import styles from "./HeroStatementCard.module.css";

interface HeroStatementCardProps {
  card: BeyondCard;
}

export default function HeroStatementCard({ card }: HeroStatementCardProps) {
  return (
    <article
      className={styles.card}
      data-beyond-reveal
      data-signal-statement
      data-beyond-band
      data-accent={card.accent}
      data-layout={card.layout}
      data-align={card.alignment}
    >
      <span className={styles.eyebrow}>{card.eyebrow}</span>

      <div className={styles.copy} data-card-copy>
        <h1 id="beyond-hero-title" tabIndex={-1} className={styles.title}>
          {card.title}
        </h1>
        <p className={styles.deck}>{card.deck}</p>
      </div>

      <div className={styles.body} data-card-copy>
        {card.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {card.notes?.length ? (
        <dl className={styles.notes}>
          {card.notes.map((note) => (
            <div key={note.id} className={styles.note} data-tone={note.tone}>
              <dt>{note.label}</dt>
              <dd>{note.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className={styles.actions}>
        {card.cta ? (
          <Link href={card.cta.href} className={styles.primaryAction}>
            {card.cta.label}
          </Link>
        ) : null}
        <Link href="/" className={styles.secondaryAction}>
          Return home
        </Link>
      </div>
    </article>
  );
}
