"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { doodles } from "@/data/doodles";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./DoodleEngine.module.css";

// =============================================================================
// DoodleEngine — Cycles through hand-drawn SVG accent marks near the hero name.
// 1 doodle visible at a time; enter/exit overlap to briefly show 2 at once.
// =============================================================================

const CYCLE_INTERVAL = 1600;

export default function DoodleEngine() {
  const prefersReducedMotion = useReducedMotion();
  const tickRef = useRef(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      tickRef.current += 1;
      setTick(tickRef.current);
    }, CYCLE_INTERVAL);

    return () => clearInterval(timer);
  }, [prefersReducedMotion]);

  // No doodles in reduced-motion mode — keep the hero clean and static.
  if (prefersReducedMotion) return null;

  const doodle = doodles[tick % doodles.length];

  return (
    <div className={styles.container} aria-hidden="true">
      <AnimatePresence>
        {/* Unique key per tick ensures AnimatePresence mounts a fresh element
            each cycle, triggering simultaneous exit + enter (1-2 visible). */}
        <motion.div
          key={tick}
          className={`${styles.doodle} ${styles[doodle.anchorHint]}`}
          initial={{ opacity: 0, scale: 0.65, rotate: -14 }}
          animate={{ opacity: 0.6, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.85, rotate: 10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg
            width={doodle.size}
            height={doodle.size}
            viewBox={doodle.viewBox}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={doodle.svgPath} />
          </svg>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
