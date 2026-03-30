"use client";

import { useRef, useState, type RefObject } from "react";
import { useScroll, useMotionValueEvent, type MotionValue } from "motion/react";

// =============================================================================
// useScrollLinkedIndex — Maps scroll progress of a container to an integer index
// Used by LandingFrame2WorkStack to determine the active project card.
// =============================================================================

interface UseScrollLinkedIndexOptions {
  itemCount: number;
}

interface UseScrollLinkedIndexResult {
  containerRef: RefObject<HTMLDivElement>;
  activeIndex: number;
  progress: MotionValue<number>;
}

export function useScrollLinkedIndex({
  itemCount,
}: UseScrollLinkedIndexOptions): UseScrollLinkedIndexResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const index = Math.min(Math.floor(progress * itemCount), itemCount - 1);
    setActiveIndex(index);
  });

  return { containerRef, activeIndex, progress: scrollYProgress };
}
