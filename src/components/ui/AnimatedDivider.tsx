"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { CSSProperties } from "react";
import type { SectionTone } from "@/types";
import { dividerVariants } from "@/lib/animations";

// =============================================================================
// AnimatedDivider — Horizontal line that scales in from left on viewport entry
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
  const dividerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: dividerRef,
    offset: ["start end", "end start"],
  });
  const driftY = useTransform(scrollYProgress, [0, 0.5, 1], [28, 0, -28]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.55, 1, 1, 0.55]);
  const dividerStyle = {
    ["--tone-from" as string]: toneGradientMap[fromTone],
    ["--tone-to" as string]: toneGradientMap[toTone],
    ["--divider-shift-y" as string]: driftY,
  } as CSSProperties;

  return (
    <motion.div
      ref={dividerRef}
      variants={dividerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15 }}
      className="section-transition-band"
      style={{
        ...dividerStyle,
        y: driftY,
        opacity,
      }}
    />
  );
}
