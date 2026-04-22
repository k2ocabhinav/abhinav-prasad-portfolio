"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
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
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const drift = useTransform(scrollYProgress, [0, 0.5, 1], [-16, 0, 16]);

  return (
    <motion.section
      ref={sectionRef}
      id={id}
      style={
        {
          ["--section-bg-shift" as string]: drift,
        } as CSSProperties
      }
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
    </motion.section>
  );
}
