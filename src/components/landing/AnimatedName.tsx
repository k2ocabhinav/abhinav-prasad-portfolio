"use client";

import { useAnimate } from "motion/react-mini";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePortalNavigation } from "@/hooks/usePortalNavigation";
import type { PortalTransitionIntent } from "@/types";
import styles from "./AnimatedName.module.css";

// =============================================================================
// AnimatedName — Technical hero wordmark with per-letter hover states.
//
// Performance strategy:
//   1. Keep each letter anchored in its own lightweight stage
//   2. Keep every hover layer CSS-driven so the engine stays responsive
//   3. Use WAAPI only for initial entrance so hover stays CSS-driven
// =============================================================================

const HOVER_COLORS = [
  "#C8FF2E",
  "#61DFFF",
  "#C8FF2E",
  "#61DFFF",
  "#C8FF2E",
  "#61DFFF",
  "#C8FF2E",
] as const;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

function cancelAnimations(...elements: Array<Element | null>) {
  for (const element of elements) {
    element?.getAnimations().forEach((animation) => animation.cancel());
  }
}

export default function AnimatedName({
  name,
  reduceMotion = false,
  portalTrigger,
}: AnimatedNameProps) {
  const prefersReducedMotion = useReducedMotion() || reduceMotion;
  const letters = name.split("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [scope, animate] = useAnimate();
  const stageRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const { getTriggerProps, isTransitioning } = usePortalNavigation();
  const triggerProps = portalTrigger ? getTriggerProps(portalTrigger) : null;

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const nodes = stageRefs.current.filter((node): node is HTMLSpanElement => node !== null);
    if (nodes.length === 0) {
      return;
    }

    nodes.forEach((node, index) => {
      cancelAnimations(node);
      void animate(
        node,
        {
          opacity: [0, 1],
          transform: [
            "translate3d(0, 34px, 0) scale(0.975)",
            "translate3d(0, 0, 0) scale(1)",
          ],
        },
        {
          delay: 0.08 + index * 0.065,
          duration: 0.65,
          ease: EASE,
        }
      );
    });
  }, [animate, prefersReducedMotion]);

  const nameMarkup = (
    <span
      ref={scope}
      className={styles.nameRow}
      data-home-hero-wordmark="true"
      aria-hidden={triggerProps ? "true" : undefined}
    >
      {letters.map((letter, index) => {
        const hoverColor = HOVER_COLORS[index] ?? "#C8FF2E";
        const isHovered = hoveredIndex === index;
        const stageStyle = {
          ["--letter-color" as string]: hoverColor,
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

        return (
          <span
            key={`${letter}-${index}`}
            className={styles.letterWrapper}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
          >
            <span
              ref={(node) => {
                stageRefs.current[index] = node;
              }}
              className={styles.letterStage}
              style={stageStyle}
              data-animated-letter-index={index}
              data-hovered={isHovered ? "true" : "false"}
            >
              <span
                className={styles.hoverAura}
                data-letter-aura="true"
                aria-hidden="true"
              >
                <span className={styles.hoverColorWash} />
                <span className={styles.hoverAccentBar} />
              </span>

              <span
                className={`${styles.glyph} ${styles.editorialGlyph}`}
                data-letter-layer="editorial"
              >
                {letter}
              </span>

              <span className={styles.scanSlice} aria-hidden="true" />
              <span className={styles.cornerTop} aria-hidden="true" />
              <span className={styles.cornerBottom} aria-hidden="true" />
            </span>
          </span>
        );
      })}
    </span>
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
