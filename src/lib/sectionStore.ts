"use client";

import { useSyncExternalStore } from "react";
import { navSpyTargets } from "@/data/navigation";

// =============================================================================
// sectionStore — one scroll/section read for every piece of chrome.
// -----------------------------------------------------------------------------
// Navigation, the cursor, the backdrop and the brand mark all need the same
// answer: which section owns the viewport midline, is it a dark ink field, and
// has the page left the hero. This module owns one IntersectionObserver and
// one scroll read per event; consumers subscribe instead of re-deriving
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
  /** True when a dark ink field intersects the fixed section rail. */
  railDark: boolean;
  /** Paper stock of the current section; sections may paint over it. */
  stock: PaperStock;
  /** "glass" once the page has scrolled past the hero threshold. */
  navMode: NavMode;
}

const INITIAL_SNAPSHOT: SectionSnapshot = {
  activeId: navSpyTargets[0]?.id ?? "",
  dark: false,
  railDark: false,
  stock: "bone",
  navMode: "transparent",
};

const PAPER_STOCK_BY_SECTION: Record<string, PaperStock> = {
  hero: "bone",
  about: "bone",
  experience: "linen",
  work: "linen",
  stack: "linen",
  contact: "bone",
};

const NAV_MODE_THRESHOLD = 80;
// A thin reading band a third of the way down the viewport. A midline band
// (-50%/-50%) let sections shorter than half the viewport (Stack on tablets)
// never become active, even right after the menu scrolled to them.
const READING_BAND_ROOT_MARGIN = "-34% 0% -65% 0%";

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
    next.railDark === snapshot.railDark &&
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
  let marqueeOverlapsRail = false;
  const bodyScrollIsLocked = () => document.body.style.position === "fixed";
  // scrollHeight and innerHeight are layout reads: taken inside a scroll or
  // rAF callback after style writes they force a synchronous recalculation.
  // The page size only changes on resize or a content-height change, so it is
  // cached here and refreshed from a ResizeObserver (which runs post-layout).
  let pageHeight = 0;
  let viewportHeight = 0;
  const measurePage = () => {
    pageHeight = document.documentElement.scrollHeight;
    viewportHeight = window.innerHeight;
  };
  measurePage();
  const pageResizeObserver = new ResizeObserver(measurePage);
  pageResizeObserver.observe(document.documentElement);
  pageResizeObserver.observe(document.body);
  window.addEventListener("resize", measurePage, { passive: true });
  const atPageBottom = () =>
    !bodyScrollIsLocked() &&
    viewportHeight + window.scrollY >= pageHeight - 2;
  const last = resolved[resolved.length - 1];
  const marquee = document.querySelector("[data-marquee]");
  const railToneObserver = marquee
    ? new IntersectionObserver(
        ([entry]) => {
          marqueeOverlapsRail = Boolean(entry?.isIntersecting);
          publish({ railDark: snapshot.dark || marqueeOverlapsRail });
        },
        { rootMargin: "-20% 0px -20% 0px" }
      )
    : null;
  if (marquee && railToneObserver) {
    railToneObserver.observe(marquee);
  }

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
      if (atPageBottom()) {
        current = last;
      }

      if (current) {
        publish({
          activeId: current.id,
          dark: current.dark,
          railDark: current.dark || marqueeOverlapsRail,
          stock: current.stock,
        });
      }
    },
    { rootMargin: READING_BAND_ROOT_MARGIN }
  );

  resolved.forEach(({ element }) => observer.observe(element));

  // One scroll read per scroll event (the browser already coalesces these to
  // one per frame), publishing only on a threshold change. It runs in the
  // event, ahead of the frame's rAF writes, so the scrollY read never forces a
  // style recalculation. Passive so it never delays the scroll itself.
  const readNavMode = () => {
    publish({
      navMode: window.scrollY > NAV_MODE_THRESHOLD ? "glass" : "transparent",
      railDark: snapshot.dark || marqueeOverlapsRail,
    });

    // At the very bottom the last section owns the highlight, even when it is
    // too short to reach the reading band.
    if (atPageBottom()) {
      publish({
        activeId: last.id,
        dark: last.dark,
        railDark: last.dark || marqueeOverlapsRail,
        stock: last.stock,
      });
    }
  };

  readNavMode();
  window.addEventListener("scroll", readNavMode, { passive: true });

  return () => {
    observer.disconnect();
    railToneObserver?.disconnect();
    pageResizeObserver.disconnect();
    window.removeEventListener("resize", measurePage);
    window.removeEventListener("scroll", readNavMode);
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
