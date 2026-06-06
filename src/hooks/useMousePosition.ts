"use client";

import { useEffect, useState, useCallback } from "react";

// =============================================================================
// useMousePosition — Global mouse position tracking for cursor effects
// =============================================================================

interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition(enabled = true): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enabled, handleMouseMove]);

  return position;
}
