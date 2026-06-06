"use client";

import { useRef, useState, type RefObject } from "react";
import {
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  type MotionValue,
} from "motion/react";

// =============================================================================
// useScrollLinkedIndex — Maps scroll progress of a container to an integer index
// Used by LandingFrame2WorkStack to determine the active project card.
// =============================================================================

interface UseScrollLinkedIndexOptions {
  itemCount: number;
  disabled?: boolean;
}

interface UseScrollLinkedIndexResult {
  containerRef: RefObject<HTMLElement | null>;
  activeIndex: number;
  activeProgress: number;
  progress: MotionValue<number>;
}

export function useScrollLinkedIndex({
  itemCount,
  disabled = false,
}: UseScrollLinkedIndexOptions): UseScrollLinkedIndexResult {
  const containerRef = useRef<HTMLElement>(null);
  const [activeProgress, setActiveProgress] = useState(0);
  const staticProgress = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: disabled ? undefined : containerRef,
    offset: ["start start", "end end"],
    trackContentSize: true,
  });

  useMotionValueEvent(disabled ? staticProgress : scrollYProgress, "change", (progress) => {
    if (disabled) {
      return;
    }

    const boundedProgress = Math.max(0, Math.min(0.9999, progress));
    setActiveProgress((previousProgress) =>
      Math.abs(previousProgress - boundedProgress) < 0.001
        ? previousProgress
        : boundedProgress
    );
  });

  const activeIndex = disabled
    ? 0
    : Math.min(Math.floor(activeProgress * itemCount), itemCount - 1);

  return {
    containerRef,
    activeIndex,
    activeProgress,
    progress: disabled ? staticProgress : scrollYProgress,
  };
}
