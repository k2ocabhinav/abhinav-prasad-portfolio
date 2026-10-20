"use client";

import * as m from "motion/react-m";
import { useInView, useMotionValue, useScroll, useTransform, useVelocity } from "motion/react";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./Marquee.module.css";

// =============================================================================
// Marquee — scroll-velocity ribbon. Solid burgundy print band; the track
// drifts left continuously and skews with scroll velocity (Lenis smooths the
// input). The rAF loop stops while off-screen and under reduced motion. A
// visible print-style control satisfies WCAG 2.2.2; hovering the band still
// pauses it, and keyboard focus on the control pauses it too. The control is
// a sibling of the band so hovering it never fights the pause it triggers.
// =============================================================================

const ITEMS = [
  "Backend systems",
  "Database design",
  "API and data contracts",
  "Reliable releases",
  "Internal developer tools",
  "Product interfaces",
  "End-to-end builds",
  "AI-assisted engineering",
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
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusPaused, setIsFocusPaused] = useState(false);
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  const x = useTransform(baseX, (value) => `${wrapValue(-50, 0, value)}%`);
  const skewX = useTransform(scrollVelocity, [-3000, 0, 3000], [4, 0, -4], {
    clamp: true,
  });

  const running =
    isInView && !prefersReducedMotion && !isPaused && !isHovered && !isFocusPaused;

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

  const togglePaused = () => {
    if (isPaused) {
      setIsPaused(false);
      // Resume from a keyboard pause too; focus alone must not keep it stuck.
      setIsFocusPaused(false);
    } else {
      setIsPaused(true);
    }
  };

  return (
    <div className={styles.shell}>
      <section
        ref={sectionRef}
        className={styles.marquee}
        data-marquee="true"
        data-marquee-running={running}
        aria-label="Areas of work"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setIsHovered(true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setIsHovered(false);
        }}
      >
        <m.div
          className={styles.track}
          data-marquee-track="true"
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
        </m.div>
      </section>

      {prefersReducedMotion ? null : (
        <button
          type="button"
          className={styles.control}
          data-marquee-control="true"
          aria-pressed={isPaused}
          aria-label={isPaused ? "Play areas of work ticker" : "Pause areas of work ticker"}
          onClick={togglePaused}
          onFocus={() => setIsFocusPaused(true)}
          onBlur={() => setIsFocusPaused(false)}
        >
          {isPaused ? (
            <Play size={14} aria-hidden="true" focusable="false" />
          ) : (
            <Pause size={14} aria-hidden="true" focusable="false" />
          )}
        </button>
      )}
    </div>
  );
}
