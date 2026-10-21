"use client";

import { scroll, useMotionValue } from "motion/react";
import type { MotionValue, UseScrollOptions } from "motion/react";
import { useEffect, type RefObject } from "react";

// =============================================================================
// useGatedScrollProgress — useScroll({ target, offset }) that only measures
// while the target is near the viewport.
// -----------------------------------------------------------------------------
// motion's scroll tracker re-measures every registered target (offsetTop walk
// up the offsetParent chain plus client/scroll sizes) on every scroll event,
// and writes every dependent motion value each frame. With a handful of
// scrubbed elements that is dozens of forced style/layout reads per frame, and
// style writes for elements nobody can see.
//
// Offsets used on this page ("start end" → "end start", "start 0.86" → ...)
// all clamp to 0 while the target is below the viewport and 1 once it has
// scrolled past, so outside the gate the value is pinned to exactly what the
// tracker would report. Inside the gate (the viewport plus half a screen on
// each side) it is the same motion tracker, so the scrub is unchanged. A single
// arithmetic check per scroll event (no layout read) decides the gate.
// =============================================================================

type ScrollOffset = NonNullable<UseScrollOptions["offset"]>;

// Half a viewport of lead on each side, so the tracker is already running
// before any part of the target can be on screen.
const GATE_FRACTION = 0.5;

export function useGatedScrollProgress(
  ref: RefObject<HTMLElement | null>,
  offset: ScrollOffset,
  enabled = true
): MotionValue<number> {
  const progress = useMotionValue(0);
  const offsetKey = JSON.stringify(offset);

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) {
      return;
    }

    let stop: (() => void) | undefined;
    const run = () => {
      stop ??= scroll((value: number) => progress.set(value), {
        target: element,
        offset: JSON.parse(offsetKey) as ScrollOffset,
      });
    };
    const halt = (pinned: number) => {
      stop?.();
      stop = undefined;
      progress.set(pinned);
    };

    // Document-space extent of the target. Measured once and again only after
    // something may have moved it (resize, document height change, the
    // target entering the observer's margin), never per scroll event.
    let top = 0;
    let bottom = 0;
    let dirty = true;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      top = rect.top + window.scrollY;
      bottom = rect.bottom + window.scrollY;
      dirty = false;
    };

    // Scrolling is the only thing that moves the target relative to the
    // viewport, so one comparison per scroll event decides the gate. This also
    // covers instant jumps (anchors, scroll restoration) that skip over the
    // target without it ever intersecting, where an observer would stay silent.
    const evaluate = () => {
      if (dirty) {
        measure();
      }
      const viewport = window.innerHeight;
      const margin = viewport * GATE_FRACTION;
      const viewTop = window.scrollY;
      if (bottom >= viewTop - margin && top <= viewTop + viewport + margin) {
        run();
      } else {
        halt(bottom < viewTop ? 1 : 0);
      }
    };

    const invalidate = () => {
      dirty = true;
      evaluate();
    };

    evaluate();

    const observer = new IntersectionObserver(invalidate, {
      rootMargin: `${GATE_FRACTION * 100}% 0px`,
    });
    observer.observe(element);
    const sizeObserver = new ResizeObserver(invalidate);
    sizeObserver.observe(document.documentElement);
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", invalidate);

    return () => {
      observer.disconnect();
      sizeObserver.disconnect();
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", invalidate);
      stop?.();
      stop = undefined;
    };
  }, [ref, progress, offsetKey, enabled]);

  return progress;
}
