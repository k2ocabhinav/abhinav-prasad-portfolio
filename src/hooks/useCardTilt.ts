"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// =============================================================================
// useCardTilt — 3D tilt effect based on mouse position within element
// =============================================================================

interface TiltValues {
  rotateX: number;
  rotateY: number;
}

const FINE_HOVER_QUERY = "(hover: hover) and (pointer: fine)";

export function useCardTilt(maxDegrees = 5) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<TiltValues>({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({
        rotateX: -y * maxDegrees,
        rotateY: x * maxDegrees,
      });
    },
    [maxDegrees]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  useEffect(() => {
    const fineHoverMedia = window.matchMedia(FINE_HOVER_QUERY);
    let removeElementListeners = () => {};

    const syncInputCapability = () => {
      removeElementListeners();
      removeElementListeners = () => {};

      if (!fineHoverMedia.matches) {
        handleMouseLeave();
        return;
      }

      const element = ref.current;
      if (!element) {
        return;
      }

      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);
      removeElementListeners = () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    };

    syncInputCapability();
    fineHoverMedia.addEventListener("change", syncInputCapability);

    return () => {
      fineHoverMedia.removeEventListener("change", syncInputCapability);
      removeElementListeners();
    };
  }, [handleMouseMove, handleMouseLeave]);

  return { ref, tilt };
}
