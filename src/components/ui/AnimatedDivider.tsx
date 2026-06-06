"use client";

import { motion } from "motion/react";
import type { CSSProperties } from "react";
import type { SectionTone } from "@/types";
import { dividerVariants } from "@/lib/animations";

// =============================================================================
// AnimatedDivider — Precision hairline that scales in from left on viewport entry
// =============================================================================

const toneGradientMap: Record<SectionTone, string> = {
  "hero-light": "var(--surface-tone-hero-light)",
  "pastel-blue": "var(--surface-tone-pastel-blue)",
  "pastel-blush": "var(--surface-tone-pastel-blush)",
  "pastel-peach": "var(--surface-tone-pastel-peach)",
  "pastel-mint": "var(--surface-tone-pastel-mint)",
  "pastel-cream": "var(--surface-tone-pastel-cream)",
};

interface AnimatedDividerProps {
  fromTone: SectionTone;
  toTone: SectionTone;
}

export default function AnimatedDivider({
  fromTone,
  toTone,
}: AnimatedDividerProps) {
  const dividerStyle = {
    ["--tone-from" as string]: toneGradientMap[fromTone],
    ["--tone-to" as string]: toneGradientMap[toTone],
  } as CSSProperties;

  return (
    <motion.div
      variants={dividerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15 }}
      className="section-divider"
      style={dividerStyle}
    />
  );
}
