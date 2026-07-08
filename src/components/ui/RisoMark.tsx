"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import styles from "./RisoMark.module.css";

// =============================================================================
// RisoMark — flat geometric section mark in the section's accent hue.
// Motion is anchored to the mark's own viewport transit (useScroll target),
// so each mark draws/moves exactly with its section — purposeful, not floating.
// Discipline: one mark per section, ≤80px total travel, linear scrub (Lenis
// already smooths scroll — no springs on top). Reduced motion renders static.
// =============================================================================

export type RisoMarkVariant = "arc" | "discs" | "bars" | "asterisk";

interface RisoMarkProps {
  variant: RisoMarkVariant;
  className?: string;
}

export default function RisoMark({ variant, className }: RisoMarkProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: prefersReducedMotion ? undefined : ref,
    offset: ["start end", "end start"],
  });

  // Shared scrubbed values (clamped; each variant uses what it needs).
  const draw = useTransform(scrollYProgress, [0.15, 0.5], [0, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const driftLeft = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  const driftRight = useTransform(scrollYProgress, [0, 1], [8, -8]);
  const barOne = useTransform(scrollYProgress, [0.12, 0.38], [0, 1]);
  const barTwo = useTransform(scrollYProgress, [0.17, 0.43], [0, 1]);
  const barThree = useTransform(scrollYProgress, [0.22, 0.48], [0, 1]);
  const barFour = useTransform(scrollYProgress, [0.27, 0.53], [0, 1]);

  const staticMode = prefersReducedMotion;

  return (
    <span ref={ref} className={cn(styles.mark, className)} aria-hidden="true">
      {variant === "arc" && (
        <svg viewBox="0 0 96 96" fill="none">
          <motion.path
            d="M 8 88 A 80 80 0 0 1 88 8"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="butt"
            style={staticMode ? undefined : { pathLength: draw }}
          />
          <circle cx="8" cy="88" r="4" fill="currentColor" />
        </svg>
      )}

      {variant === "discs" && (
        <svg viewBox="0 0 96 96" fill="none">
          <motion.circle
            cx="38"
            cy="48"
            r="26"
            fill="currentColor"
            style={staticMode ? undefined : { x: driftLeft }}
          />
          <motion.circle
            cx="60"
            cy="48"
            r="26"
            stroke="currentColor"
            strokeWidth="2.5"
            style={staticMode ? undefined : { x: driftRight }}
          />
        </svg>
      )}

      {variant === "bars" && (
        <svg viewBox="0 0 96 96" fill="none">
          {[
            { y: 22, mv: barOne },
            { y: 40, mv: barTwo },
            { y: 58, mv: barThree },
            { y: 76, mv: barFour },
          ].map(({ y, mv }) => (
            <motion.rect
              key={y}
              x="8"
              y={y}
              width="80"
              height="8"
              fill="currentColor"
              className={styles.bar}
              style={staticMode ? undefined : { scaleX: mv }}
            />
          ))}
        </svg>
      )}

      {variant === "asterisk" && (
        <motion.svg
          viewBox="0 0 96 96"
          fill="none"
          style={staticMode ? undefined : { rotate }}
        >
          {[0, 30, 60, 90, 120, 150].map((deg) => (
            <line
              key={deg}
              x1="48"
              y1="12"
              x2="48"
              y2="84"
              stroke="currentColor"
              strokeWidth="3"
              transform={`rotate(${deg} 48 48)`}
            />
          ))}
          <circle cx="48" cy="48" r="6" fill="var(--color-paper, #F0EEE9)" />
        </motion.svg>
      )}
    </span>
  );
}
