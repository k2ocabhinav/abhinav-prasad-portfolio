"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { SectionBlendStyle, SectionTexture, SectionTone } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
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
  /** Optional section texture treatment */
  texture?: SectionTexture;
  /** Optional top-edge blend from previous section tone */
  blendTopFrom?: SectionTone;
  /** Optional bottom-edge blend to next section tone */
  blendBottomTo?: SectionTone;
  /** Controls handoff intensity */
  blendStyle?: SectionBlendStyle;
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

const toneSurfaceMap: Record<SectionTone, string> = {
  "hero-light": "var(--surface-tone-hero-light)",
  "pastel-blue": "var(--surface-tone-pastel-blue)",
  "pastel-blush": "var(--surface-tone-pastel-blush)",
  "pastel-peach": "var(--surface-tone-pastel-peach)",
  "pastel-mint": "var(--surface-tone-pastel-mint)",
  "pastel-cream": "var(--surface-tone-pastel-cream)",
};

export default function SectionWrapper({
  id,
  children,
  fullHeight = false,
  centered = false,
  tone,
  texture = "none",
  blendTopFrom,
  blendBottomTo,
  blendStyle = "soft",
  className = "",
}: SectionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const drift = useTransform(scrollYProgress, [0, 0.5, 1], [-16, 0, 16]);
  const topBlendY = useTransform(scrollYProgress, [0, 0.5, 1], [-8, -4, 0]);
  const topBlendOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.45, 0.68, 0.9]);
  const bottomBlendY = useTransform(scrollYProgress, [0, 0.5, 1], [0, 4, 8]);
  const bottomBlendOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 0.68, 0.45]);
  const surface = tone ? toneSurfaceMap[tone] : "var(--section-bg, var(--color-surface))";

  return (
    <motion.section
      ref={sectionRef}
      id={id}
      style={
        {
          ["--section-bg-shift" as string]: prefersReducedMotion ? 0 : drift,
        } as CSSProperties
      }
      className={cn(
        styles.section,
        tone ? toneClassMap[tone] : undefined,
        texture === "ruled" && styles.textureRuled,
        blendStyle === "bold" ? styles.blendBold : styles.blendSoft,
        fullHeight && styles.fullHeight,
        centered && styles.centered,
        className
      )}
    >
      {blendTopFrom ? (
        <motion.span
          aria-hidden="true"
          className={cn(styles.edgeBlend, styles.edgeBlendTop)}
          style={
            {
              ["--edge-from" as string]: toneSurfaceMap[blendTopFrom],
              ["--edge-to" as string]: surface,
              y: prefersReducedMotion ? 0 : topBlendY,
              opacity: prefersReducedMotion ? 0.82 : topBlendOpacity,
            } as CSSProperties
          }
        />
      ) : null}
      {blendBottomTo ? (
        <motion.span
          aria-hidden="true"
          className={cn(styles.edgeBlend, styles.edgeBlendBottom)}
          style={
            {
              ["--edge-from" as string]: surface,
              ["--edge-to" as string]: toneSurfaceMap[blendBottomTo],
              y: prefersReducedMotion ? 0 : bottomBlendY,
              opacity: prefersReducedMotion ? 0.82 : bottomBlendOpacity,
            } as CSSProperties
          }
        />
      ) : null}
      <div className={cn("content-container", styles.inner)}>
        {children}
      </div>
    </motion.section>
  );
}
