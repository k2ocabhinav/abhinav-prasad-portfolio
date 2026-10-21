"use client";

import * as m from "motion/react-m";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { BeyondAlbumItem } from "@/types";
import styles from "./FallbackDeck.module.css";

interface FallbackDeckProps {
  items: BeyondAlbumItem[];
  onSelect: (item: BeyondAlbumItem, trigger: HTMLButtonElement) => void;
}

export default function FallbackDeck({ items, onSelect }: FallbackDeckProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className={styles.deckSection} aria-labelledby="fallback-deck-title" data-fallback-deck>
      <div className={styles.deckHeading}>
        <h2 id="fallback-deck-title">Moments from the room</h2>
        <p>Swipe through, or open one to read more.</p>
      </div>
      <div className={styles.deck} aria-label="Room moments">
        {items.map((item) => (
          <m.button
            key={item.id}
            type="button"
            className={styles.card}
            data-color={item.color}
            aria-label={`Open ${item.title}`}
            onClick={(event) => onSelect(item, event.currentTarget)}
            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
          >
            <span className={styles.kind}>{item.kind}</span>
            <strong>{item.title}</strong>
            {item.quote ? <q>{item.quote}</q> : null}
            <span className={styles.caption}>{item.caption}</span>
            <span className={styles.action}>Open moment</span>
          </m.button>
        ))}
      </div>
    </section>
  );
}
