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
  containerRef: RefObject<HTMLDivElement | null>;
  activeIndex: number;
  progress: MotionValue<number>;
}

export function useScrollLinkedIndex({
  itemCount,
  disabled = false,
}: UseScrollLinkedIndexOptions): UseScrollLinkedIndexResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const staticProgress = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: disabled ? undefined : containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(disabled ? staticProgress : scrollYProgress, "change", (progress) => {
    if (disabled) {
      return;
    }

    const index = Math.min(Math.floor(progress * itemCount), itemCount - 1);
    // Guard repeated updates from the same bucket so sticky scroll does not
    // trigger unnecessary rerenders while the user is still within one segment.
    setActiveIndex((previousIndex) =>
      previousIndex === index ? previousIndex : index
    );
  });

  return {
    containerRef,
    activeIndex,
    progress: disabled ? staticProgress : scrollYProgress,
  };
}
