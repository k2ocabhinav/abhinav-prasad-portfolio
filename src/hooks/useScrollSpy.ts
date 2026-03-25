"use client";

import { useEffect, useState, useCallback } from "react";

// =============================================================================
// useScrollSpy — Tracks which section is currently in viewport
// =============================================================================

export function useScrollSpy(sectionIds: string[], threshold = 0.5): string {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds, threshold]);

  return activeSection;
}
