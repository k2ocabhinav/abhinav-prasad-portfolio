"use client";

import { useRef, useEffect, type RefObject } from "react";
import { useMotionValue, useSpring, type MotionValue } from "motion/react";
import { magneticSpring } from "@/lib/animations";

// =============================================================================
// useMagneticHover — Magnetic pull toward cursor on hover.
// Writes to motion values (no per-pixel React re-render) and returns
// spring-smoothed x/y. Recomputes the resting rect on enter/scroll/resize so
// the magnet stays anchored when content scrolls under a stationary cursor.
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

    let rect = el.getBoundingClientRect();
    const recompute = () => {
      rect = el.getBoundingClientRect();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      rawX.set((e.clientX - cx) * strength);
      rawY.set((e.clientY - cy) * strength);
    };
    const handleMouseLeave = () => {
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

      el.addEventListener("mouseenter", recompute);
      el.addEventListener("mousemove", handleMouseMove);
      el.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("scroll", recompute, { passive: true });
      window.addEventListener("resize", recompute);

      detach = () => {
        el.removeEventListener("mouseenter", recompute);
        el.removeEventListener("mousemove", handleMouseMove);
        el.removeEventListener("mouseleave", handleMouseLeave);
        window.removeEventListener("scroll", recompute);
        window.removeEventListener("resize", recompute);
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
