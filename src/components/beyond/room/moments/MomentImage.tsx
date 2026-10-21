"use client";

import Image from "next/image";
import type { BeyondAlbumItem } from "@/types";
import { getBeyondImageSrc, getMomentColor } from "./media";
import styles from "./MomentOverlays.module.css";

export default function MomentImage({
  item,
  width,
  alt,
  placeholder,
}: {
  item: BeyondAlbumItem;
  width: 480 | 960 | 1600;
  alt: string;
  placeholder?: string;
}) {
  const src = getBeyondImageSrc(item, width);
  const posterSrc = src ?? placeholder;

  if (posterSrc) {
    return (
      <Image
        src={posterSrc}
        alt={src ? alt : ""}
        fill
        sizes={width === 1600 ? "min(94vw, 1280px)" : "min(80vw, 720px)"}
        unoptimized={posterSrc.startsWith("data:")}
        className={styles.photo}
      />
    );
  }

  const initials = item.title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className={styles.poster} style={{ backgroundColor: getMomentColor(item) }}>
      <span className={styles.posterLine} aria-hidden="true" />
      <strong aria-hidden="true">{initials || "BT"}</strong>
      <span className={styles.posterTitle}>{item.title}</span>
    </div>
  );
}
