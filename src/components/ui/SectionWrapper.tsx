import type { ReactNode } from "react";
import type { SectionTone } from "@/types";
import { cn } from "@/lib/utils";
import styles from "./SectionWrapper.module.css";

// =============================================================================
// SectionWrapper — Consistent section padding, snap alignment, and id for scroll spy
// =============================================================================

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  /** Use full viewport height with centered content */
  fullHeight?: boolean;
  /** Center content both axes */
  centered?: boolean;
  /** Optional pastel surface tone used by long-scroll sections */
  tone?: SectionTone;
  className?: string;
}

const toneClassMap: Record<SectionTone, string> = {
  "hero-light": styles.toneHeroLight,
  "pastel-blue": styles.tonePastelBlue,
  "pastel-blush": styles.tonePastelBlush,
  "pastel-peach": styles.tonePastelPeach,
  "pastel-mint": styles.tonePastelMint,
  "pastel-cream": styles.tonePastelCream,
};

export default function SectionWrapper({
  id,
  children,
  fullHeight = false,
  centered = false,
  tone,
  className = "",
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        styles.section,
        tone ? toneClassMap[tone] : undefined,
        fullHeight && styles.fullHeight,
        centered && styles.centered,
        className
      )}
    >
      <div className={cn("content-container", styles.inner)}>
        {children}
      </div>
    </section>
  );
}
