"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { sections } from "@/data/navigation";
import { orbSpring } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./SageOrb.module.css";

// =============================================================================
// SageOrb — printers' registration-mark cursor.
//
// A hairline circle + crosshair (~18px) that adopts the current section's
// accent. Position comes from motion values written by a single passive
// pointermove listener, so pointer movement costs zero React renders.
// Rendered only for fine pointers with motion allowed (nothing on touch or
// under prefers-reduced-motion).
// =============================================================================

const MARK_SIZE = 18;
const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, summary, [data-cursor-grow]";

// Riso accents per section, palette v2 (fallbacks until P0 tokens land).
const ORB_ACCENTS: Record<string, string> = {
  hero: "var(--color-ink, #0B1011)",
  about: "var(--color-ink, #0B1011)",
  experience: "var(--color-cornflower-deep, #25447B)",
  work: "var(--color-lead, #6A2135)",
  stack: "var(--color-lovebird-deep, #4E5312)",
  presence: "var(--color-petrol, #1A5D74)",
  contact: "var(--color-lead, #6A2135)",
};

export default function SageOrb() {
  const prefersReducedMotion = useReducedMotion();
  const sectionIds = useMemo(() => sections.map((s) => s.id), []);
  const emptySectionIds = useMemo<string[]>(() => [], []);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: fine) and (min-width: 768px)");
    const update = () => setFinePointer(pointerQuery.matches);
    update();
    pointerQuery.addEventListener("change", update);
    return () => pointerQuery.removeEventListener("change", update);
  }, []);

  const pointerEnabled = finePointer && !prefersReducedMotion;

  const x = useMotionValue(-MARK_SIZE);
  const y = useMotionValue(-MARK_SIZE);
  const targetScale = useMotionValue(1);
  const springX = useSpring(x, orbSpring);
  const springY = useSpring(y, orbSpring);
  const scale = useSpring(targetScale, orbSpring);
  const markX = useTransform(springX, (value) => value - MARK_SIZE / 2);
  const markY = useTransform(springY, (value) => value - MARK_SIZE / 2);

  useEffect(() => {
    if (!pointerEnabled) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target;
      const overInteractive =
        target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null;
      targetScale.set(overInteractive ? 1.4 : 1);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerover", handlePointerOver, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
    };
  }, [pointerEnabled, x, y, targetScale]);

  const activeSection = useScrollSpy(pointerEnabled ? sectionIds : emptySectionIds);
  const accent = ORB_ACCENTS[activeSection] ?? ORB_ACCENTS.hero;

  if (!pointerEnabled) {
    return null;
  }

  return (
    <motion.div
      data-site-chrome="cursor-orb"
      className={styles.orb}
      style={{ x: markX, y: markY, scale, color: accent }}
    >
      <svg
        className={styles.mark}
        viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`}
        aria-hidden="true"
        focusable="false"
      >
        <circle cx={MARK_SIZE / 2} cy={MARK_SIZE / 2} r={MARK_SIZE / 2 - 1} />
        <line x1={MARK_SIZE / 2} y1="0.5" x2={MARK_SIZE / 2} y2={MARK_SIZE / 2 - 3.5} />
        <line
          x1={MARK_SIZE / 2}
          y1={MARK_SIZE / 2 + 3.5}
          x2={MARK_SIZE / 2}
          y2={MARK_SIZE - 0.5}
        />
        <line x1="0.5" y1={MARK_SIZE / 2} x2={MARK_SIZE / 2 - 3.5} y2={MARK_SIZE / 2} />
        <line
          x1={MARK_SIZE / 2 + 3.5}
          y1={MARK_SIZE / 2}
          x2={MARK_SIZE - 0.5}
          y2={MARK_SIZE / 2}
        />
      </svg>
    </motion.div>
  );
}
