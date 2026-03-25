"use client";

import { useRef, useState, useEffect } from "react";

// =============================================================================
// useSectionInView — Track when section enters viewport with heading/content stagger
// =============================================================================

export function useSectionInView(externalRef?: React.RefObject<HTMLDivElement | null>, threshold = 0.2) {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = externalRef || internalRef;
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return { ref, isInView };
}
