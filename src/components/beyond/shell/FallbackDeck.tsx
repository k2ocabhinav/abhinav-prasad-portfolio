"use client";

import Image from "next/image";
import * as m from "motion/react-m";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { BeyondAlbumItem } from "@/types";
import { getBeyondImageSrc, getBeyondPlaceholder } from "@/components/beyond/room/moments/media";
import styles from "./FallbackDeck.module.css";

interface FallbackDeckProps {
  items: BeyondAlbumItem[];
  onSelect: (item: BeyondAlbumItem, trigger: HTMLButtonElement) => void;
}

export default function FallbackDeck({ items, onSelect }: FallbackDeckProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className={styles.deckSection}
      aria-labelledby="fallback-deck-title"
      data-fallback-deck
      data-beyond-fallback
      data-beyond-deck
    >
      <div className={styles.deckHeading}>
        <h2 id="fallback-deck-title">Moments from the room</h2>
        <p>Swipe through, or open one to read more.</p>
      </div>
      <div className={styles.deck} aria-label="Room moments">
        {items.map((item) => (
          <FallbackCard key={item.id} item={item} reduceMotion={reduceMotion} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}

function FallbackCard({
  item,
  reduceMotion,
  onSelect,
}: {
  item: BeyondAlbumItem;
  reduceMotion: boolean;
  onSelect: FallbackDeckProps["onSelect"];
}) {
  const imageSrc = getBeyondImageSrc(item, 480);
  const placeholder = getBeyondPlaceholder(item);

  return (
    <m.button
      type="button"
      className={styles.card}
      data-color={item.color}
      aria-label={`Open ${item.title}`}
      onClick={(event) => onSelect(item, event.currentTarget)}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
    >
      {imageSrc ? (
        <span className={styles.thumbnail}>
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 700px) 20vw, 8rem"
            placeholder={placeholder ? "blur" : "empty"}
            blurDataURL={placeholder}
            unoptimized={imageSrc.startsWith("data:")}
          />
        </span>
      ) : null}
      <span className={styles.kind}>{item.kind}</span>
      <strong>{item.title}</strong>
      {item.quote ? <q>{item.quote}</q> : null}
      <span className={styles.caption}>{item.caption}</span>
      <span className={styles.action}>Open moment</span>
    </m.button>
  );
}
