import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { BeyondMedia } from "@/types";
import styles from "./EditorialMediaFrame.module.css";

interface EditorialMediaFrameProps {
  media: BeyondMedia;
  caption?: string;
  className?: string;
  priority?: boolean;
  tone?: "shell" | "paper";
}

export default function EditorialMediaFrame({
  media,
  caption,
  className,
  priority,
  tone = "shell",
}: EditorialMediaFrameProps) {
  return (
    <figure
      className={cn(styles.figure, tone === "paper" && styles.paper, className)}
      data-tone={media.surfaceTone ?? "neutral"}
      style={{ ["--media-aspect" as string]: media.aspectRatio } as CSSProperties}
    >
      <div className={styles.frame}>
        <Image
          src={media.src}
          alt={media.alt}
          fill
          priority={priority ?? media.priority ?? false}
          sizes="(max-width: 1023px) 100vw, 48vw"
          className={styles.image}
        />
      </div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
