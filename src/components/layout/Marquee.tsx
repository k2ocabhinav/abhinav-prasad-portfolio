"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
  useVelocity,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./Marquee.module.css";

// =============================================================================
// Marquee — scroll-velocity ribbon. Solid burgundy print band; the track
// drifts left continuously and skews with scroll velocity (Lenis smooths the
// input). The rAF loop stops while off-screen and under reduced motion, and
// pauses whenever a pointer or keyboard focus enters the band (WCAG 2.2.2).
// =============================================================================

// Kept sentence-case and led by the orchestration positioning; database
// engineering stays a single supporting item rather than the headline.
const ITEMS = [
  "AI orchestration",
  "Backend systems",
  "Release automation",
  "Cloud delivery",
  "Database engineering",
  "Design engineering",
];

function wrapValue(min: number, max: number, value: number): number {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

export default function Marquee() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.01 });
  const [isPaused, setIsPaused] = useState(false);
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  const x = useTransform(baseX, (value) => `${wrapValue(-50, 0, value)}%`);
  const skewX = useTransform(scrollVelocity, [-3000, 0, 3000], [4, 0, -4], {
    clamp: true,
  });

  const running = isInView && !prefersReducedMotion && !isPaused;

  useEffect(() => {
    if (!running) {
      return;
    }

    let frameId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const velocity = scrollVelocity.get();
      baseX.set(baseX.get() - 3.5 * dt - (velocity / 220) * dt);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [running, baseX, scrollVelocity]);

  return (
    <section
      ref={sectionRef}
      className={styles.marquee}
      data-marquee="true"
      aria-label="Areas of work"
      tabIndex={0}
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <motion.div
        className={styles.track}
        aria-hidden="true"
        style={{ x, skewX: running ? skewX : 0 }}
      >
        {[0, 1].map((dup) => (
          <div className={styles.group} key={dup}>
            {ITEMS.map((item) => (
              <span className={styles.item} key={`${item}-${dup}`}>
                {item}
                <span className={styles.sep} />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
