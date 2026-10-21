"use client";

import type { RefObject } from "react";
import type { BeyondAlbumItem } from "@/types";
import { getBeyondImageSrc } from "./media";
import MomentImage from "./MomentImage";
import styles from "./MomentOverlays.module.css";

export default function PhotoDialog({
  item,
  onClose,
  closeButtonRef,
  dialogRef,
}: {
  item: BeyondAlbumItem;
  onClose: () => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  dialogRef: RefObject<HTMLDivElement | null>;
}) {
  const src = getBeyondImageSrc(item, 1600);
  if (!src) return null;

  return (
    <div className={`${styles.modalBackdrop} ${styles.photoBackdrop}`} onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Full-size photo for ${item.title}`}
        className={styles.photoDialog}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          className={styles.closeButton}
          type="button"
          onClick={onClose}
          aria-label="Close full-size photo"
        >
          Close
        </button>
        <div className={styles.largeImage}>
          <MomentImage item={item} width={1600} alt={item.image?.alt ?? item.title} />
        </div>
        <p className={styles.photoCaption}>{item.title}</p>
      </div>
    </div>
  );
}
