"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useTransform,
  useVelocity,
} from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./Marquee.module.css";

// =============================================================================
// Marquee — scroll-velocity ribbon divider. Drifts left continuously and
// speeds up / skews with scroll velocity (Lenis already smooths the input).
// =============================================================================

const ITEMS = [
  "Backend systems",
  "Cloud architecture",
  "Real-time platforms",
  "AI systems",
  "Design engineering",
  "Production-grade",
];

function wrapValue(min: number, max: number, value: number): number {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

export default function Marquee() {
  const prefersReducedMotion = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  const x = useTransform(baseX, (value) => `${wrapValue(-50, 0, value)}%`);
  const skewX = useTransform(scrollVelocity, [-3000, 0, 3000], [4, 0, -4], {
    clamp: true,
  });

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion) return;
    const dt = delta / 1000;
    const velocity = scrollVelocity.get();
    // base leftward drift + a boost proportional to scroll speed
    const moveBy = -3.5 * dt - (velocity / 220) * dt;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <section className={styles.marquee} aria-hidden="true">
      <motion.div
        className={styles.track}
        style={{ x, skewX: prefersReducedMotion ? 0 : skewX }}
      >
        {[0, 1].map((dup) => (
          <div className={styles.group} key={dup}>
            {ITEMS.map((item) => (
              <span className={styles.item} key={`${item}-${dup}`}>
                {item}
                <span className={styles.sep}>✦</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
