"use client";

import { useSyncExternalStore } from "react";
import { navSpyTargets } from "@/data/navigation";

// =============================================================================
// sectionStore — one scroll/section read for every piece of chrome.
// -----------------------------------------------------------------------------
// Navigation, the cursor, the backdrop and the brand mark all need the same
// answer: which section owns the viewport midline, is it a dark ink field, and
// has the page left the hero. This module owns one IntersectionObserver and
// one rAF-throttled scroll read; consumers subscribe instead of re-deriving
// the same state.
//
// `useSyncExternalStore` only notifies on an actual change, so scrolling does
// not re-render chrome that has nothing new to show. The observer's root is
// collapsed to a zero-height band at the midline, so exactly one target is
// "current" at any position and slow scrolls cannot flicker between stocks.
// =============================================================================

export type PaperStock = "bone" | "linen";
export type NavMode = "transparent" | "glass";

export interface SectionSnapshot {
  /** Navigation item id for the target at the viewport midline. */
  activeId: string;
  /** True when that target paints a dark ink field behind the chrome. */
  dark: boolean;
  /** Paper stock of the current section; sections may paint over it. */
  stock: PaperStock;
  /** "glass" once the page has scrolled past the hero threshold. */
  navMode: NavMode;
}

const INITIAL_SNAPSHOT: SectionSnapshot = {
  activeId: navSpyTargets[0]?.id ?? "",
  dark: false,
  stock: "bone",
  navMode: "transparent",
};

const PAPER_STOCK_BY_SECTION: Record<string, PaperStock> = {
  hero: "bone",
  about: "bone",
  experience: "linen",
  work: "linen",
  stack: "bone",
  contact: "bone",
};

const NAV_MODE_THRESHOLD = 80;
const MIDLINE_ROOT_MARGIN = "-50% 0% -50% 0%";

interface ResolvedTarget {
  element: Element;
  id: string;
  dark: boolean;
  stock: PaperStock;
}

let snapshot: SectionSnapshot = INITIAL_SNAPSHOT;
const listeners = new Set<() => void>();
let stopEngine: (() => void) | null = null;

function publish(patch: Partial<SectionSnapshot>) {
  const next = { ...snapshot, ...patch };
  if (
    next.activeId === snapshot.activeId &&
    next.dark === snapshot.dark &&
    next.stock === snapshot.stock &&
    next.navMode === snapshot.navMode
  ) {
    return;
  }

  snapshot = next;
  listeners.forEach((listener) => listener());
}

function startEngine(): () => void {
  const resolved: ResolvedTarget[] = [];
  navSpyTargets.forEach(({ id, selector, dark }) => {
    const element = document.querySelector(selector);
    if (!element) {
      return;
    }
    resolved.push({
      element,
      id,
      dark: Boolean(dark),
      stock: PAPER_STOCK_BY_SECTION[id] ?? "bone",
    });
  });

  if (resolved.length === 0) {
    return () => {};
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
        if (visible.has(target.element)) {
          current = target;
        }
      });

      if (current) {
        publish({
          activeId: current.id,
          dark: current.dark,
          stock: current.stock,
        });
      }
    },
    { rootMargin: MIDLINE_ROOT_MARGIN }
  );

  resolved.forEach(({ element }) => observer.observe(element));

  // One scroll read, coalesced into a frame, publishing only on a threshold
  // change. Passive so it never delays the scroll itself.
  let frame = 0;
  const readNavMode = () => {
    frame = 0;
    publish({
      navMode: window.scrollY > NAV_MODE_THRESHOLD ? "glass" : "transparent",
    });
  };
  const handleScroll = () => {
    if (frame === 0) {
      frame = window.requestAnimationFrame(readNavMode);
    }
  };

  readNavMode();
  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    observer.disconnect();
    if (frame !== 0) {
      window.cancelAnimationFrame(frame);
    }
    window.removeEventListener("scroll", handleScroll);
  };
}

/** Shared subscription used by React and by imperative consumers (cursor). */
export function subscribeToSection(listener: () => void): () => void {
  listeners.add(listener);
  if (!stopEngine) {
    stopEngine = startEngine();
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && stopEngine) {
      stopEngine();
      stopEngine = null;
    }
  };
}

export function getSectionSnapshot(): SectionSnapshot {
  return snapshot;
}

function getServerSectionSnapshot(): SectionSnapshot {
  return INITIAL_SNAPSHOT;
}

/** React binding: re-renders only when the section, tone or nav mode changes. */
export function useSectionState(): SectionSnapshot {
  return useSyncExternalStore(
    subscribeToSection,
    getSectionSnapshot,
    getServerSectionSnapshot
  );
}
