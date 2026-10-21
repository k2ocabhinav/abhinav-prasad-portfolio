"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { BeyondAlbumItem } from "@/types";
import { getBeyondImageSrc, getBeyondPlaceholder } from "./media";
import MomentImage from "./MomentImage";
import styles from "./MomentOverlays.module.css";

export default function PostcardDialog({
  item,
  onClose,
  onOpenPhoto,
  closeButtonRef,
  dialogRef,
}: {
  item: BeyondAlbumItem;
  onClose: () => void;
  onOpenPhoto: () => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  dialogRef: RefObject<HTMLDivElement | null>;
}) {
  const [flipped, setFlipped] = useState(false);
  const frontTurnRef = useRef<HTMLButtonElement>(null);
  const backTurnRef = useRef<HTMLButtonElement>(null);
  const previousFlip = useRef(flipped);
  const fullSrc = getBeyondImageSrc(item, 1600);
  const placeholder = getBeyondPlaceholder(item);

  useEffect(() => {
    if (previousFlip.current !== flipped) {
      (flipped ? backTurnRef.current : frontTurnRef.current)?.focus({ preventScroll: true });
    }
    previousFlip.current = flipped;
  }, [flipped]);

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      data-testid="postcard-backdrop"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Postcard for ${item.title}`}
        className={styles.postcardDialog}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          className={styles.closeButton}
          type="button"
          onClick={onClose}
          aria-label="Close postcard"
        >
          Close
        </button>
        <div className={styles.cardPerspective}>
          <div className={`${styles.postcard} ${flipped ? styles.flipped : ""}`}>
            <section className={styles.postcardFront} aria-hidden={flipped}>
              <div className={styles.frontImage}>
                <MomentImage
                  item={item}
                  width={960}
                  alt={item.image?.alt ?? item.title}
                  placeholder={placeholder}
                />
                {fullSrc ? (
                  <button
                    type="button"
                    className={styles.openPhoto}
                    aria-label={`Open full-size photo for ${item.title}`}
                    onClick={onOpenPhoto}
                    tabIndex={flipped ? -1 : 0}
                  >
                    View full size
                  </button>
                ) : null}
              </div>
              <div className={styles.frontCopy}>
                <p>{item.kind}</p>
                <h2>{item.title}</h2>
                <button
                  ref={frontTurnRef}
                  className={styles.turnButton}
                  type="button"
                  onClick={() => setFlipped(true)}
                  tabIndex={flipped ? -1 : 0}
                >
                  Turn over postcard
                </button>
              </div>
            </section>
            <section className={styles.postcardBack} aria-hidden={!flipped}>
              <p className={styles.backKicker}>A note from the room</p>
              <h2>{item.title}</h2>
              <p className={styles.caption}>{item.caption}</p>
              {item.quote ? <blockquote>{item.quote}</blockquote> : null}
              {item.meta ? <p className={styles.meta}>{item.meta}</p> : null}
              {item.tags.length ? (
                <ul className={styles.tags} aria-label="Tags">
                  {item.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              ) : null}
              <button
                ref={backTurnRef}
                className={styles.turnButton}
                type="button"
                onClick={() => setFlipped(false)}
                tabIndex={flipped ? 0 : -1}
              >
                Return to front
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
