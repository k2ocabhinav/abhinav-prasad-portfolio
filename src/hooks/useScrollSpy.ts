"use client";

import { useEffect, useState } from "react";
import type { NavSpyTarget } from "@/data/navigation";

// =============================================================================
// useScrollSpy — Tracks which section sits at the viewport midline
// -----------------------------------------------------------------------------
// The observer's root is collapsed to a zero-height band on the midline, so
// exactly one target is "current" at any scroll position. The previous 0.5
// intersection threshold could never be reached by sections taller than two
// viewports, which is why the rail used to stay stuck on "hover" for most of
// the page.
// =============================================================================

export interface ScrollSpyState {
  /** Navigation item id for the target at the midline. */
  activeId: string;
  /** True when that target paints a dark ink field (nav flips to bone ink). */
  dark: boolean;
}

interface ResolvedTarget {
  element: Element;
  id: string;
  dark: boolean;
}

export function useScrollSpy(targets: readonly NavSpyTarget[]): ScrollSpyState {
  const [state, setState] = useState<ScrollSpyState>({
    activeId: targets[0]?.id ?? "",
    dark: false,
  });

  useEffect(() => {
    const resolved: ResolvedTarget[] = [];
    targets.forEach(({ id, selector, dark }) => {
      const element = document.querySelector(selector);
      if (element) resolved.push({ element, id, dark: Boolean(dark) });
    });

    if (resolved.length === 0) {
      return;
    }

    const visible = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.add(entry.target);
          } else {
            visible.delete(entry.target);
          }
        });

        // At a boundary two targets can share the midline frame; the later one
        // in document order wins so the highlight only ever moves forward.
        let current: ResolvedTarget | undefined;
        resolved.forEach((target) => {
          if (visible.has(target.element)) current = target;
        });

        if (!current) {
          return;
        }
        setState((previous) =>
          previous.activeId === current!.id && previous.dark === current!.dark
            ? previous
            : { activeId: current!.id, dark: current!.dark }
        );
      },
      { rootMargin: "-50% 0% -50% 0%" }
    );

    resolved.forEach(({ element }) => observer.observe(element));
    return () => observer.disconnect();
  }, [targets]);

  return state;
}
