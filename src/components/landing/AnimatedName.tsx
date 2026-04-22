"use client";

import { useAnimate } from "motion/react-mini";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePortalNavigation } from "@/hooks/usePortalNavigation";
import type { PortalTransitionIntent } from "@/types";
import styles from "./AnimatedName.module.css";

// =============================================================================
// AnimatedName — Editorial hero wordmark with per-letter premium hover states.
//
// Performance strategy:
//   1. Keep each letter anchored in its own lightweight stage
//   2. Preserve script/decorations as always-mounted DOM, only transition
//      transform/opacity/color on hover
//   3. Use WAAPI only for initial entrance so hover stays CSS-driven
// =============================================================================

const HOVER_COLORS = [
  "#FFB728",   // A — amber
  "#396FBC",   // b — cobalt
  "#FF31AB",   // h — magenta
  "#FF5745",   // i — vermilion
  "#C7B3FF",   // n — lilac
  "#E95330",   // a — orange-red
  "#FBFF3E",   // v — electric yellow
] as const;

const SCRIPT_OFFSETS = [
  { x: "0.01em", y: "0.01em", scale: 0.84 },
  { x: "-0.02em", y: "0.02em", scale: 1.1 },
  { x: "-0.01em", y: "0.01em", scale: 1.08 },
  { x: "0em", y: "0.02em", scale: 1.06 },
  { x: "0.01em", y: "0.01em", scale: 1.08 },
  { x: "-0.02em", y: "0.02em", scale: 1.08 },
  { x: "0.02em", y: "0em", scale: 1.08 },
] as const;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function LetterDecoration({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <svg width="72" height="36" viewBox="0 0 72 36" fill="none" aria-hidden="true">
          <circle cx="36" cy="6" r="3.5" fill="#FFB728" opacity="0.9" />
          <circle cx="14" cy="18" r="2.5" fill="#FFB728" opacity="0.65" />
          <circle cx="58" cy="18" r="2.5" fill="#FFB728" opacity="0.65" />
        </svg>
      );
    case 1:
      return (
        <svg width="48" height="52" viewBox="0 0 48 52" fill="none" aria-hidden="true">
          <circle cx="24" cy="15" r="10" stroke="#396FBC" strokeWidth="1.5" opacity="0.8" />
          <circle cx="24" cy="37" r="12" stroke="#396FBC" strokeWidth="1.5" opacity="0.55" />
        </svg>
      );
    case 2:
      return (
        <svg width="88" height="22" viewBox="0 0 88 22" fill="none" aria-hidden="true">
          <line
            x1="4"
            y1="11"
            x2="84"
            y2="11"
            stroke="#FF31AB"
            strokeWidth="1.5"
            opacity="0.9"
            strokeLinecap="round"
          />
          <polyline
            points="12,4 4,11 12,18"
            stroke="#FF31AB"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <polyline
            points="76,4 84,11 76,18"
            stroke="#FF31AB"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        </svg>
      );
    case 3:
      return (
        <svg width="44" height="64" viewBox="0 0 44 64" fill="none" aria-hidden="true">
          <line
            x1="6"
            y1="8"
            x2="38"
            y2="8"
            stroke="#FF5745"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />
          <line
            x1="6"
            y1="56"
            x2="38"
            y2="56"
            stroke="#FF5745"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />
          <circle cx="22" cy="32" r="3.5" fill="#FF5745" opacity="0.45" />
        </svg>
      );
    case 4:
      return (
        <svg width="64" height="56" viewBox="0 0 64 56" fill="none" aria-hidden="true">
          <line
            x1="8"
            y1="48"
            x2="56"
            y2="8"
            stroke="#396FBC"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.9"
          />
          <circle cx="56" cy="8" r="3.5" fill="#396FBC" opacity="0.85" />
          <circle cx="8" cy="48" r="2.5" fill="#396FBC" opacity="0.55" />
        </svg>
      );
    case 5:
      return (
        <svg width="76" height="40" viewBox="0 0 76 40" fill="none" aria-hidden="true">
          <path
            d="M 4 36 Q 16 6 28 36"
            stroke="#C7B3FF"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M 26 36 Q 38 2 50 36"
            stroke="#C7B3FF"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M 48 36 Q 60 6 72 36"
            stroke="#C7B3FF"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>
      );
    case 6:
      return (
        <svg width="68" height="44" viewBox="0 0 68 44" fill="none" aria-hidden="true">
          <polyline
            points="8,8 34,36 60,8"
            stroke="#FBFF3E"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <circle cx="34" cy="40" r="2.5" fill="#FBFF3E" opacity="0.7" />
        </svg>
      );
    default:
      return null;
  }
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
        const hoverColor = HOVER_COLORS[index] ?? "#FFB728";
        const scriptOffset = SCRIPT_OFFSETS[index] ?? SCRIPT_OFFSETS[0];
        const isHovered = hoveredIndex === index;
        const stageStyle = {
          ["--letter-color" as string]: hoverColor,
          ["--script-offset-x" as string]: scriptOffset.x,
          ["--script-offset-y" as string]: scriptOffset.y,
          ["--script-scale" as string]: String(scriptOffset.scale),
          ["--script-idle-scale" as string]: String(scriptOffset.scale * 0.92),
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
                data-visible={isHovered ? "false" : "true"}
              >
                {letter}
              </span>

              <span className={styles.scriptPositioner} aria-hidden="true">
                <span
                  className={`${styles.glyph} ${styles.scriptGlyph}`}
                  data-letter-layer="script"
                  data-visible={isHovered ? "true" : "false"}
                >
                  {letter}
                </span>
              </span>

              <span
                className={styles.decoration}
                data-letter-decoration="true"
                data-visible={isHovered ? "true" : "false"}
                aria-hidden="true"
              >
                <LetterDecoration index={index} />
              </span>
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
