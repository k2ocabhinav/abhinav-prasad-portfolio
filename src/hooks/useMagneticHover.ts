"use client";

import { useRef, useEffect, type RefObject } from "react";
import { useMotionValue, useSpring, type MotionValue } from "motion/react";
import { magneticSpring } from "@/lib/animations";

// =============================================================================
// useMagneticHover — Magnetic pull toward cursor on hover.
// Writes to motion values (no per-pixel React re-render) and returns
// spring-smoothed x/y. The resting rect is read lazily: enter, scroll and
// resize only mark it stale and the next mouse move measures it, so the magnet
// stays anchored when content scrolls under a stationary cursor without a
// layout read per scroll event per button. The scroll listener exists only
// while the pointer is over the button.
// Only attached on fine pointer + hover devices; off for touch and reduced
// motion (the pull would fight the OS animation preference).
// =============================================================================

interface MagneticHover {
  ref: RefObject<HTMLElement | null>;
  x: MotionValue<number>;
  y: MotionValue<number>;
}

const FINE_HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function useMagneticHover(strength = 0.25): MagneticHover {
  const ref = useRef<HTMLElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, magneticSpring);
  const y = useSpring(rawY, magneticSpring);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fineHover = window.matchMedia(FINE_HOVER_QUERY);
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);

    let rect: DOMRect | null = null;
    const invalidate = () => {
      rect = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      rect ??= el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      rawX.set((e.clientX - cx) * strength);
      rawY.set((e.clientY - cy) * strength);
    };
    const handleMouseEnter = () => {
      invalidate();
      window.addEventListener("scroll", invalidate, { passive: true });
    };
    const handleMouseLeave = () => {
      window.removeEventListener("scroll", invalidate);
      rawX.set(0);
      rawY.set(0);
    };

    let detach = () => {};

    const syncInputCapability = () => {
      detach();
      detach = () => {};

      if (!fineHover.matches || reducedMotion.matches) {
        handleMouseLeave();
        return;
      }

      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mousemove", handleMouseMove);
      el.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("resize", invalidate);

      detach = () => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mousemove", handleMouseMove);
        el.removeEventListener("mouseleave", handleMouseLeave);
        window.removeEventListener("scroll", invalidate);
        window.removeEventListener("resize", invalidate);
      };
    };

    syncInputCapability();
    fineHover.addEventListener("change", syncInputCapability);
    reducedMotion.addEventListener("change", syncInputCapability);

    return () => {
      fineHover.removeEventListener("change", syncInputCapability);
      reducedMotion.removeEventListener("change", syncInputCapability);
      detach();
    };
  }, [strength, rawX, rawY]);

  return { ref, x, y };
}
