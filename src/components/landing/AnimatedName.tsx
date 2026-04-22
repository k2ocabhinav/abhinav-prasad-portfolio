"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { useIsFirefox } from "@/hooks/useIsFirefox";
import { usePortalNavigation } from "@/hooks/usePortalNavigation";
import type { PortalTransitionIntent } from "@/types";
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

const SCRIPT_OFFSETS = [
  { x: "-0.04em", y: "0.01em", scale: 1.08 },
  { x: "-0.02em", y: "0.02em", scale: 1.1 },
  { x: "-0.01em", y: "0.01em", scale: 1.08 },
  { x: "0em", y: "0.02em", scale: 1.06 },
  { x: "0.01em", y: "0.01em", scale: 1.08 },
  { x: "-0.02em", y: "0.02em", scale: 1.08 },
  { x: "0.02em", y: "0em", scale: 1.08 },
] as const;

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

const performanceLetterEnterVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

function HoverAura({
  hoverColor,
  reducedEffects = false,
}: {
  hoverColor: string;
  reducedEffects?: boolean;
}) {
  const effectStyle = {
    ["--letter-glow" as string]: hoverColor,
  } as CSSProperties;

  return (
    <motion.span
      className={styles.hoverAura}
      style={effectStyle}
      initial={{ opacity: 0, scale: 0.72 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.14 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <motion.span
        className={styles.hoverBloom}
        initial={{ opacity: 0, scale: 0.65 }}
        animate={{ opacity: reducedEffects ? 0.62 : 0.92, scale: 1 }}
        exit={{ opacity: 0, scale: 1.15 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      />
      {reducedEffects ? null : (
        <>
          <motion.span
            className={styles.hoverSweep}
            initial={{ opacity: 0, x: "-28%", rotate: -12 }}
            animate={{ opacity: 0.65, x: "24%", rotate: 8 }}
            exit={{ opacity: 0, x: "34%", rotate: 16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.span
            className={`${styles.sparkleDot} ${styles.sparkleDotUpper}`}
            initial={{ opacity: 0, scale: 0.4, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.3, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
          />
          <motion.span
            className={`${styles.sparkleDot} ${styles.sparkleDotLower}`}
            initial={{ opacity: 0, scale: 0.35, x: -8 }}
            animate={{ opacity: 0.95, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.25, x: 10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          />
        </>
      )}
    </motion.span>
  );
}

interface AnimatedNameProps {
  name: string;
  reduceMotion?: boolean;
  portalTrigger?: {
    href: string;
    source: PortalTransitionIntent["source"];
    variant?: PortalTransitionIntent["variant"];
    skin?: PortalTransitionIntent["skin"];
  };
}

export default function AnimatedName({
  name,
  reduceMotion = false,
  portalTrigger,
}: AnimatedNameProps) {
  const systemReducedMotion = useReducedMotion();
  const isFirefox = useIsFirefox();
  const prefersReducedMotion = reduceMotion || systemReducedMotion;
  const usePerformanceMode = prefersReducedMotion || isFirefox;
  const letters = name.split("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { getTriggerProps, isTransitioning } = usePortalNavigation();
  const triggerProps = portalTrigger ? getTriggerProps(portalTrigger) : null;

  const nameMarkup = prefersReducedMotion ? (
    <span className={styles.nameStatic} data-home-hero-wordmark="true">
      {letters.map((letter, i) => {
        const isHovered = hoveredIndex === i;
        const hoverColor = HOVER_COLORS[i] ?? "#D4A849";
        const scriptOffset = SCRIPT_OFFSETS[i] ?? SCRIPT_OFFSETS[0];
        const stageStyle = {
          ["--script-offset-x" as string]: scriptOffset.x,
          ["--script-offset-y" as string]: scriptOffset.y,
          ["--letter-color" as string]: hoverColor,
        } as CSSProperties;

        return (
          <span
            key={`${letter}-${i}`}
            className={styles.letterWrapper}
          >
            <motion.span
              className={styles.letterStage}
              style={stageStyle}
              data-animated-letter-index={i}
              data-hovered={isHovered ? "true" : "false"}
              onHoverStart={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
              animate={{
                color: isHovered ? hoverColor : "var(--color-on-surface)",
                scale: isHovered ? 1.04 : 1,
              }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className={`${styles.glyph} ${styles.editorialGlyph}`}
                data-letter-layer="editorial"
                data-visible={isHovered ? "false" : "true"}
                animate={{
                  opacity: isHovered ? 0.18 : 1,
                  filter: "none",
                  scaleX: isHovered ? 0.96 : 1,
                }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {letter}
              </motion.span>

              <span className={styles.scriptPositioner} aria-hidden="true">
                <motion.span
                  className={`${styles.glyph} ${styles.scriptGlyph}`}
                  data-letter-layer="script"
                  data-visible={isHovered ? "true" : "false"}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    filter: "none",
                    y: isHovered ? "-0.02em" : "0.04em",
                    scale: isHovered ? scriptOffset.scale : scriptOffset.scale * 0.94,
                  }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {letter}
                </motion.span>
              </span>

              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    className={styles.decoration}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <LetterDecoration index={i} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
          </span>
        );
      })}
    </span>
  ) : (
    <motion.span
      className={styles.nameRow}
      variants={containerVariants}
      initial={false}
      animate="visible"
      data-home-hero-wordmark="true"
    >
      {letters.map((letter, i) => {
        const isHovered = hoveredIndex === i;
        const hoverColor = HOVER_COLORS[i] ?? "#D4A849";
        const scriptOffset = SCRIPT_OFFSETS[i] ?? SCRIPT_OFFSETS[0];
        const stageStyle = {
          ["--script-offset-x" as string]: scriptOffset.x,
          ["--script-offset-y" as string]: scriptOffset.y,
          ["--letter-color" as string]: hoverColor,
        } as CSSProperties;

        return (
          <motion.span
            key={`${letter}-${i}`}
            className={styles.letterWrapper}
            variants={usePerformanceMode ? performanceLetterEnterVariants : letterEnterVariants}
          >
            <motion.span
              className={styles.letterStage}
              style={stageStyle}
              data-animated-letter-index={i}
              data-hovered={isHovered ? "true" : "false"}
              onHoverStart={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
              animate={{
                color: isHovered ? hoverColor : "var(--color-on-surface)",
                scale: isHovered ? (usePerformanceMode ? 1.04 : 1.08) : 1,
                y: isHovered ? (usePerformanceMode ? "-0.045em" : "-0.08em") : "0em",
              }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatePresence>
                {isHovered ? (
                  <HoverAura
                    hoverColor={hoverColor}
                    reducedEffects={usePerformanceMode}
                  />
                ) : null}
              </AnimatePresence>

              <motion.span
                className={`${styles.glyph} ${styles.editorialGlyph}`}
                data-letter-layer="editorial"
                data-visible={isHovered ? "false" : "true"}
                animate={{
                  opacity: isHovered ? 0.18 : 1,
                  filter:
                    isHovered && !usePerformanceMode ? "blur(8px)" : "none",
                  scaleX: isHovered ? 0.94 : 1,
                  scaleY: isHovered ? 0.98 : 1,
                }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {letter}
              </motion.span>

              <span className={styles.scriptPositioner} aria-hidden="true">
                <motion.span
                  className={`${styles.glyph} ${styles.scriptGlyph}`}
                  data-letter-layer="script"
                  data-visible={isHovered ? "true" : "false"}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    filter:
                      isHovered || usePerformanceMode ? "none" : "blur(10px)",
                    y: isHovered ? (usePerformanceMode ? "-0.02em" : "-0.04em") : "0.08em",
                    scale: isHovered ? scriptOffset.scale : scriptOffset.scale * (usePerformanceMode ? 0.95 : 0.9),
                    rotate: isHovered || usePerformanceMode ? 0 : -1.5,
                  }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  {letter}
                </motion.span>
              </span>

              {/* SVG decoration — appears above the letter on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    className={styles.decoration}
                    initial={{ opacity: 0, scale: 0.4, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.3, y: 6 }}
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <LetterDecoration index={i} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
          </motion.span>
        );
      })}
    </motion.span>
  );

  if (!portalTrigger || triggerProps === null) {
    return (
      <span className={styles.nameShell} aria-label={name}>
        {nameMarkup}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={`${styles.nameShell} ${styles.nameTrigger}`}
      aria-label={name}
      data-animated-name="hero-trigger"
      onPointerDown={triggerProps.onPointerDown}
      onKeyDown={triggerProps.onKeyDown}
      onClick={triggerProps.onClick}
      disabled={isTransitioning}
    >
      {nameMarkup}
    </button>
  );
}
