"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import styles from "./AnimatedName.module.css";

// =============================================================================
// AnimatedName — Per-letter hover animations for the hero name.
//
// Each character in the name has:
//   1. Staggered entrance (blur → sharp, slide up) on load
//   2. Unique hover color (gold, lavender, rose, sky cycling)
//   3. A unique SVG decoration that appears above the letter on hover
// =============================================================================

// Hover accent colors — each position has a character identity
const HOVER_COLORS = [
  "#D4A849", // A → warm gold
  "#B8A9F0", // B → lavender
  "#E8A0B4", // H → dusty rose
  "#D4A849", // I → gold
  "#8BC4E8", // N → soft sky
  "#B8A9F0", // A → lavender
  "#D4A849", // V → gold
];

// Unique SVG decorations per letter index — appear on hover above each character
function LetterDecoration({ index }: { index: number }) {
  switch (index) {
    case 0: // A — three golden sparks in an arc
      return (
        <svg width="72" height="36" viewBox="0 0 72 36" fill="none" aria-hidden="true">
          <circle cx="36" cy="6" r="3.5" fill="#D4A849" opacity="0.9" />
          <circle cx="14" cy="18" r="2.5" fill="#D4A849" opacity="0.65" />
          <circle cx="58" cy="18" r="2.5" fill="#D4A849" opacity="0.65" />
        </svg>
      );
    case 1: // B — two lavender rings (the two bumps of the B)
      return (
        <svg width="48" height="52" viewBox="0 0 48 52" fill="none" aria-hidden="true">
          <circle cx="24" cy="15" r="10" stroke="#B8A9F0" strokeWidth="1.5" opacity="0.8" />
          <circle cx="24" cy="37" r="12" stroke="#B8A9F0" strokeWidth="1.5" opacity="0.55" />
        </svg>
      );
    case 2: // H — rose horizontal bar with arrow tips
      return (
        <svg width="88" height="22" viewBox="0 0 88 22" fill="none" aria-hidden="true">
          <line x1="4" y1="11" x2="84" y2="11" stroke="#E8A0B4" strokeWidth="1.5" opacity="0.9" strokeLinecap="round" />
          <polyline points="12,4 4,11 12,18" stroke="#E8A0B4" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
          <polyline points="76,4 84,11 76,18" stroke="#E8A0B4" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        </svg>
      );
    case 3: // I — gold serif bars top and bottom + centre glow dot
      return (
        <svg width="44" height="64" viewBox="0 0 44 64" fill="none" aria-hidden="true">
          <line x1="6" y1="8" x2="38" y2="8" stroke="#D4A849" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <line x1="6" y1="56" x2="38" y2="56" stroke="#D4A849" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <circle cx="22" cy="32" r="3.5" fill="#D4A849" opacity="0.45" />
        </svg>
      );
    case 4: // N — sky diagonal line with terminal dot
      return (
        <svg width="64" height="56" viewBox="0 0 64 56" fill="none" aria-hidden="true">
          <line x1="8" y1="48" x2="56" y2="8" stroke="#8BC4E8" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
          <circle cx="56" cy="8" r="3.5" fill="#8BC4E8" opacity="0.85" />
          <circle cx="8" cy="48" r="2.5" fill="#8BC4E8" opacity="0.55" />
        </svg>
      );
    case 5: // A (second) — lavender crown of three arcs
      return (
        <svg width="76" height="40" viewBox="0 0 76 40" fill="none" aria-hidden="true">
          <path d="M 4 36 Q 16 6 28 36" stroke="#B8A9F0" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.75" />
          <path d="M 26 36 Q 38 2 50 36" stroke="#B8A9F0" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.9" />
          <path d="M 48 36 Q 60 6 72 36" stroke="#B8A9F0" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.75" />
        </svg>
      );
    case 6: // V — gold chevron with centre drop dot
      return (
        <svg width="68" height="44" viewBox="0 0 68 44" fill="none" aria-hidden="true">
          <polyline
            points="8,8 34,36 60,8"
            stroke="#D4A849"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <circle cx="34" cy="40" r="2.5" fill="#D4A849" opacity="0.7" />
        </svg>
      );
    default:
      return null;
  }
}

// Container stagger — letters enter sequentially
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

// Per-letter entrance — blur dissolve + slide
const letterEnterVariants = {
  hidden: { opacity: 0, y: 32, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

interface AnimatedNameProps {
  name: string;
  reduceMotion?: boolean;
}

export default function AnimatedName({ name, reduceMotion = false }: AnimatedNameProps) {
  const systemReducedMotion = useReducedMotion();
  const skip = reduceMotion || systemReducedMotion;
  const letters = name.toUpperCase().split("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (skip) {
    return (
      <div className={styles.nameStatic} aria-label={name}>
        {name.toUpperCase()}
      </div>
    );
  }

  return (
    <motion.div
      className={styles.nameRow}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={name}
    >
      {letters.map((letter, i) => {
        const isHovered = hoveredIndex === i;
        const hoverColor = HOVER_COLORS[i] ?? "#D4A849";

        return (
          <motion.span
            key={i}
            className={styles.letterWrapper}
            variants={letterEnterVariants}
          >
            <motion.span
              className={styles.letter}
              onHoverStart={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
              animate={{
                color: isHovered ? hoverColor : "var(--color-on-surface)",
                scale: isHovered ? 1.1 : 1,
                y: isHovered ? "-0.06em" : "0em",
              }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {letter}

              {/* SVG decoration — appears above the letter on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    className={styles.decoration}
                    initial={{ opacity: 0, scale: 0.4, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.3, y: 6 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <LetterDecoration index={i} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
          </motion.span>
        );
      })}
    </motion.div>
  );
}
