"use client";

import { useState, type CSSProperties, type PointerEvent } from "react";
import { usePortalNavigation } from "@/hooks/usePortalNavigation";
import type { PortalTransitionIntent } from "@/types";
import styles from "./AnimatedName.module.css";

// =============================================================================
// AnimatedName — Technical hero wordmark with per-letter hover states.
//
// Performance strategy:
//   1. Keep each letter anchored in its own lightweight stage
//   2. Keep every hover layer CSS-driven so the engine stays responsive
//   3. The entrance is a first-paint CSS keyframe on transform only: the
//      server-rendered letters are final at first paint and never blank while
//      JS hydrates.
// =============================================================================

// Single matte accent — every letter hovers in the lead ink (burgundy).
const HOVER_COLORS = [
  "var(--color-lead, #6A2135)",
  "var(--color-lead, #6A2135)",
  "var(--color-lead, #6A2135)",
  "var(--color-lead, #6A2135)",
  "var(--color-lead, #6A2135)",
  "var(--color-lead, #6A2135)",
  "var(--color-lead, #6A2135)",
] as const;

const PORTAL_LETTER_INDEX = 6;

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
  const letters = name.split("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { getTriggerProps, isTransitioning } = usePortalNavigation();
  const triggerProps = portalTrigger ? getTriggerProps(portalTrigger) : null;

  const nameMarkup = (
    <span
      className={styles.nameRow}
      data-home-hero-wordmark="true"
      data-reduce-motion={reduceMotion ? "true" : "false"}
    >
      {letters.map((letter, index) => {
        const hoverColor = HOVER_COLORS[index] ?? "var(--color-lead, #6A2135)";
        const isHovered = hoveredIndex === index;
        const isPortalLetter =
          Boolean(portalTrigger && triggerProps) && index === PORTAL_LETTER_INDEX;
        const stageStyle = {
          ["--letter-color" as string]: hoverColor,
          ["--letter-line" as string]: "#0B1011",
          ["--letter-delay" as string]: `${0.05 + index * 0.055}s`,
        } as CSSProperties;

        const handlePointerEnter = (event: PointerEvent<HTMLSpanElement>) => {
          if (event.pointerType === "touch") {
            return;
          }
          setHoveredIndex(index);
        };

        const handlePointerLeave = (event: PointerEvent<HTMLSpanElement>) => {
          if (event.pointerType === "touch") {
            return;
          }
          setHoveredIndex((current) => (current === index ? null : current));
        };

        const letterStage = (
          <span
            className={styles.letterStage}
            style={stageStyle}
            data-animated-letter-index={index}
            data-hovered={isHovered ? "true" : "false"}
            data-portal-letter={isPortalLetter ? "true" : "false"}
          >
            <span
              className={styles.hoverAura}
              data-letter-aura="true"
              aria-hidden="true"
            >
              <span className={styles.hoverAccentBar} />
            </span>

            <span
              className={`${styles.glyph} ${styles.editorialGlyph}`}
              data-letter-layer="editorial"
            >
              {letter}
            </span>

            <span className={styles.cornerTop} aria-hidden="true" />
            <span className={styles.cornerBottom} aria-hidden="true" />
          </span>
        );

        return (
          <span
            key={`${letter}-${index}`}
            className={styles.letterWrapper}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
          >
            {isPortalLetter && triggerProps ? (
              <button
                type="button"
                className={styles.letterPortalButton}
                aria-label="Open Beyond The Terminal"
                data-animated-name="hero-trigger"
                onPointerDown={triggerProps.onPointerDown}
                onKeyDown={triggerProps.onKeyDown}
                onClick={triggerProps.onClick}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex((current) => (current === index ? null : current))}
                disabled={isTransitioning}
              >
                {letterStage}
              </button>
            ) : (
              letterStage
            )}
          </span>
        );
      })}
    </span>
  );

  return (
    <h1 className={styles.nameShell} aria-label={name}>
      {nameMarkup}
    </h1>
  );
}
