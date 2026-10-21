"use client";

import { useEffect } from "react";

// How long after the last scroll event the page still counts as scrolling.
const SETTLE_MS = 120;

/**
 * Marks the document while it is actively scrolling: `html[data-scrolling]`
 * is set on the first scroll event and cleared SETTLE_MS after the last one.
 *
 * Cards slide under a stationary pointer while the page scrolls, and each one
 * would start (and then reverse) its hover transition: border, shadow and
 * filter changes that restyle and repaint on every frame of the fade. CSS
 * uses this flag to apply those hover states without easing while the page
 * moves. Nothing is withheld: the hover look is identical, it just lands in
 * one frame instead of repainting for twenty.
 *
 * One passive listener and at most one timer; the timer is re-armed from a
 * timestamp rather than cleared and recreated on every scroll event.
 */
export function useScrollingFlag() {
  useEffect(() => {
    const root = document.documentElement;
    let lastScroll = 0;
    let timer = 0;

    const settle = () => {
      const remaining = SETTLE_MS - (performance.now() - lastScroll);
      if (remaining > 4) {
        timer = window.setTimeout(settle, remaining);
        return;
      }

      timer = 0;
      delete root.dataset.scrolling;
    };

    const handleScroll = () => {
      lastScroll = performance.now();
      if (timer === 0) {
        root.dataset.scrolling = "";
        timer = window.setTimeout(settle, SETTLE_MS);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(timer);
      delete root.dataset.scrolling;
    };
  }, []);
}
