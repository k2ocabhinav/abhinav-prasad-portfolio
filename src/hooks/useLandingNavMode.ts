"use client";

import { useState, useEffect } from "react";

// =============================================================================
// useLandingNavMode — Returns nav transparency state based on scroll position.
// "transparent" = over hero (near top), "glass" = scrolled past threshold.
// Used by Navigation to toggle dot/label colors over the landing hero.
// =============================================================================

export function useLandingNavMode(threshold = 80): "transparent" | "glass" {
  const [mode, setMode] = useState<"transparent" | "glass">("transparent");

  useEffect(() => {
    const handleScroll = () => {
      setMode(window.scrollY > threshold ? "glass" : "transparent");
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return mode;
}
