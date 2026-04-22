import Image from "next/image";
import { cn } from "@/lib/utils";
import type { BeyondSymbol, BeyondVisual } from "@/types";
import styles from "./BeyondSymbolFrame.module.css";

interface BeyondSymbolFrameProps {
  media: BeyondVisual;
  symbol?: BeyondSymbol;
  label?: string;
  className?: string;
  priority?: boolean;
}

export default function BeyondSymbolFrame({
  media,
  symbol,
  label,
  className,
  priority,
}: BeyondSymbolFrameProps) {
  return (
    <figure
      className={cn(styles.figure, className)}
      data-tone={media.surfaceTone ?? "neutral"}
    >
      <div
        className={styles.frame}
        style={{ ["--media-aspect" as string]: media.aspectRatio }}
      >
        <div className={styles.mediaWrap}>
          <Image
            src={media.src}
            alt={media.alt}
            fill
            priority={priority ?? media.priority ?? false}
            sizes="(max-width: 767px) 100vw, (max-width: 1180px) 50vw, 42vw"
            className={styles.media}
          />
        </div>

        {symbol ? (
          <span
            className={cn(
              styles.symbol,
              symbol.placement === "top-right" && styles.symbolTopRight,
              symbol.placement === "bottom-left" && styles.symbolBottomLeft,
              symbol.placement === "bottom-right" && styles.symbolBottomRight,
              symbol.placement === "center" && styles.symbolCenter
            )}
            data-accent={symbol.accent}
            aria-hidden="true"
          >
            <Image src={symbol.src} alt="" width={72} height={72} className={styles.symbolImage} />
          </span>
        ) : null}
      </div>
      {label ? <figcaption className={styles.caption}>{label}</figcaption> : null}
    </figure>
  );
}
