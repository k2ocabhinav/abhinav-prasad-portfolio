"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// =============================================================================
// useMagneticHover — Magnetic pull effect toward cursor on hover
// =============================================================================

interface MagneticOffset {
  x: number;
  y: number;
}

export function useMagneticHover(strength = 0.25) {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState<MagneticOffset>({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setOffset({
        x: (e.clientX - cx) * strength,
        y: (e.clientY - cy) * strength,
      });
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return { ref, offset };
}
