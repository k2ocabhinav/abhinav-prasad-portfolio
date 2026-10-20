"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties, type PointerEvent } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { BeyondAlbumColor, BeyondAlbumItem, BeyondAlbumSize } from "@/types";
import styles from "./BeyondPhotoWall.module.css";

interface BeyondPhotoWallProps {
  items: BeyondAlbumItem[];
  intro: {
    eyebrow: string;
    title: string;
    deck: string;
  };
}

const colorClassMap: Record<BeyondAlbumColor, string> = {
  cobalt: styles.cobalt,
  coral: styles.coral,
  lemon: styles.lemon,
  amber: styles.amber,
  lilac: styles.lilac,
  pink: styles.pink,
};

const sizeClassMap: Record<BeyondAlbumSize, string> = {
  hero: styles.sizeHero,
  wide: styles.sizeWide,
  tall: styles.sizeTall,
  square: styles.sizeSquare,
};

function getPosterInitials(title: string) {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function AlbumMedia({ item, large = false }: { item: BeyondAlbumItem; large?: boolean }) {
  const mediaStyle = {
    ["--poster-color" as string]: item.image?.dominantColor,
    ["--poster-aspect" as string]: item.image?.aspectRatio,
  } as CSSProperties;

  if (item.image?.src) {
    return (
      <span className={cn(styles.media, large && styles.mediaLarge)} style={mediaStyle}>
        <Image
          src={item.image.src}
          alt={item.image.alt}
          fill
          sizes={large ? "min(92vw, 980px)" : "(max-width: 768px) 92vw, 34vw"}
          className={styles.photo}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(styles.media, styles.poster, large && styles.mediaLarge)}
      style={mediaStyle}
      aria-label={item.image?.alt ?? `${item.title} poster`}
      role="img"
    >
      <span className={styles.posterGrid} aria-hidden="true" />
      <span className={styles.posterTape} aria-hidden="true" />
      <span className={styles.posterInitials}>{getPosterInitials(item.title)}</span>
      {item.quote ? <span className={styles.posterQuote}>{item.quote}</span> : null}
    </span>
  );
}

export default function BeyondPhotoWall({ items, intro }: BeyondPhotoWallProps) {
  const reduceMotion = useReducedMotion();
  const [activeItem, setActiveItem] = useState<BeyondAlbumItem | null>(null);

  useEffect(() => {
    if (!activeItem) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveItem(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeItem]);

  const handlePointerMove = (
    event: PointerEvent<HTMLButtonElement>,
    item: BeyondAlbumItem
  ) => {
    if (reduceMotion || event.pointerType !== "mouse" || item.size === "hero") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    event.currentTarget.style.setProperty("--px", x.toFixed(3));
    event.currentTarget.style.setProperty("--py", y.toFixed(3));
  };

  const handlePointerLeave = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty("--px", "0");
    event.currentTarget.style.setProperty("--py", "0");
  };

  return (
    <>
      <section className={styles.hero} aria-labelledby="beyond-hero-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>{intro.eyebrow}</span>
          <h1 id="beyond-hero-title" className={styles.title} tabIndex={-1}>
            {intro.title}
          </h1>
          <p className={styles.deck}>{intro.deck}</p>
        </div>

        <div className={styles.heroPile} aria-hidden="true">
          {items.slice(0, 4).map((item, index) => (
            <span
              key={item.id}
              className={cn(styles.heroSticker, colorClassMap[item.color])}
              style={{ ["--sticker-index" as string]: index } as CSSProperties}
            >
              <span>{item.kind}</span>
              <strong>{item.title}</strong>
            </span>
          ))}
        </div>
      </section>

      <section className={styles.wallSection} aria-label="Beyond The Terminal photo wall">
        <div className={styles.wallMeta}>
          <span>Album wall</span>
          <span>{items.length.toString().padStart(2, "0")} entries</span>
        </div>

        <div className={styles.wallGrid}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                styles.card,
                sizeClassMap[item.size],
                colorClassMap[item.color]
              )}
              onPointerMove={(event) => handlePointerMove(event, item)}
              onPointerLeave={handlePointerLeave}
              onClick={() => setActiveItem(item)}
              aria-label={`Open ${item.title}`}
            >
              <AlbumMedia item={item} />
              <span className={styles.cardChrome} aria-hidden="true" />
              <span className={styles.cardBody}>
                <span className={styles.kind}>{item.kind}</span>
                <strong className={styles.cardTitle}>{item.title}</strong>
                <span className={styles.caption}>{item.caption}</span>
                <span className={styles.tags}>
                  {item.tags.slice(0, 4).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeItem ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          onClick={() => setActiveItem(null)}
        >
          <div
            className={cn(styles.lightboxPanel, colorClassMap[activeItem.color])}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setActiveItem(null)}
              aria-label="Close album item"
            >
              Close
            </button>
            <AlbumMedia item={activeItem} large />
            <div className={styles.lightboxCopy}>
              <span className={styles.kind}>{activeItem.kind}</span>
              <h2>{activeItem.title}</h2>
              <p>{activeItem.caption}</p>
              {activeItem.quote ? <blockquote>{activeItem.quote}</blockquote> : null}
              {activeItem.meta ? <span className={styles.meta}>{activeItem.meta}</span> : null}
              <div className={styles.tags}>
                {activeItem.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
