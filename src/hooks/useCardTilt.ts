"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useMotionValue, useSpring, type MotionValue } from "motion/react";
import { tiltSpring } from "@/lib/animations";

// =============================================================================
// useCardTilt — 3D tilt driven by motion values, not React state.
// -----------------------------------------------------------------------------
// The pointer loop writes straight to spring-smoothed rotateX/rotateY values,
// so a card never re-renders while the cursor moves. The card rect is read
// lazily: pointerenter and resize only mark it stale, and the next pointermove
// measures it once. Cards that scroll under a still pointer fire pointerenter
// with no move, so they never force a layout.
// Attached only for fine, hovering pointers with motion allowed; coarse
// pointers and reduced motion get a completely static card.
// =============================================================================

interface CardTilt {
  ref: RefObject<HTMLDivElement | null>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
}

const FINE_HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function useCardTilt(maxDegrees = 5): CardTilt {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), tiltSpring);
  const rotateY = useSpring(useMotionValue(0), tiltSpring);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const fineHover = window.matchMedia(FINE_HOVER_QUERY);
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);

    let rect: DOMRect | null = null;
    const invalidateRect = () => {
      rect = null;
    };

    const handlePointerMove = (event: MouseEvent) => {
      rect ??= element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      rotateX.set(-y * maxDegrees);
      rotateY.set(x * maxDegrees);
    };

    const handlePointerLeave = () => {
      rotateX.set(0);
      rotateY.set(0);
    };

    let detach = () => {};

    const syncInputCapability = () => {
      detach();
      detach = () => {};

      if (!fineHover.matches || reducedMotion.matches) {
        handlePointerLeave();
        return;
      }

      element.addEventListener("pointerenter", invalidateRect);
      element.addEventListener("pointermove", handlePointerMove);
      element.addEventListener("pointerleave", handlePointerLeave);
      window.addEventListener("resize", invalidateRect);

      detach = () => {
        element.removeEventListener("pointerenter", invalidateRect);
        element.removeEventListener("pointermove", handlePointerMove);
        element.removeEventListener("pointerleave", handlePointerLeave);
        window.removeEventListener("resize", invalidateRect);
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
  }, [maxDegrees, rotateX, rotateY]);

  return { ref, rotateX, rotateY };
}
