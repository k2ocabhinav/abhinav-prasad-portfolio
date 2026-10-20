"use client";

import { useEffect, useRef } from "react";

export default function StackSettle() {
  const sentinelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const stage = sentinel?.closest<HTMLElement>("[data-stack-stage]");
    if (
      !stage ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let isInView = false;
    let hasStarted = false;

    const syncMotion = () => {
      const isVisible = isInView && document.visibilityState === "visible";
      if (isVisible && !hasStarted) {
        hasStarted = true;
        stage.dataset.stackMotion = "settling";
      }
      if (hasStarted && !isVisible) {
        stage.dataset.motionPaused = "true";
      } else {
        delete stage.dataset.motionPaused;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView = Boolean(entry?.isIntersecting);
        syncMotion();
      },
      { threshold: 0.15 }
    );

    observer.observe(stage);
    document.addEventListener("visibilitychange", syncMotion);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncMotion);
      delete stage.dataset.motionPaused;
    };
  }, []);

  return <span ref={sentinelRef} aria-hidden="true" hidden />;
}
