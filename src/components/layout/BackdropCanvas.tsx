"use client";

import { useEffect, useRef } from "react";
import { sections } from "@/data/navigation";
import styles from "./BackdropCanvas.module.css";

// =============================================================================
// BackdropCanvas — palette v2 canvas with bone and linen paper rooms (pink is an ink, never a page background).
// As each section crosses the viewport midline the canvas fades (0.8s CSS
// transition) to its paper stock. Fields are painted by their sections.
// Snap-per-section, never continuous interpolation (muddy midpoints).
// The grain layer is the single page-wide texture (feTurbulence, multiply).
// =============================================================================

const SECTION_STOCKS: Record<string, string> = {
  hero: "bone",
  services: "linen",
  about: "bone",
  experience: "linen",
  work: "linen",
  stack: "bone",
  contact: "bone",
};

export default function BackdropCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observedStocks = new Map<Element, string>();
    // rootMargin -50%/-50% collapses the observation band to the viewport
    // midline: exactly one section is ever "dominant", so the stock snaps
    // once per crossing — no edge flicker on slow scrolls.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && canvasRef.current) {
            canvasRef.current.dataset.stock = observedStocks.get(entry.target) ?? "bone";
          }
        });
      },
      { rootMargin: "-50% 0% -50% 0%" }
    );

    const observe = (element: Element | null, stock: string) => {
      if (!element) return;
      observedStocks.set(element, stock);
      observer.observe(element);
    };

    sections.forEach(({ id }) => {
      observe(document.getElementById(id), SECTION_STOCKS[id] ?? "bone");
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={canvasRef}
      aria-hidden="true"
      className={styles.canvas}
      data-stock="bone"
      data-home-backdrop-canvas="true"
    >
      <span className={styles.grain} aria-hidden="true" />
    </div>
  );
}
