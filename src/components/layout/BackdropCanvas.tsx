"use client";

import { useEffect, useRef } from "react";
import { sections } from "@/data/navigation";
import styles from "./BackdropCanvas.module.css";

// =============================================================================
// BackdropCanvas — warm-paper canvas with tinted "stock" rooms.
// As each section crosses the viewport midline the canvas fades (0.8s CSS
// transition) to that section's paper stock — like turning pages of different
// paper. Snap-per-section, never continuous interpolation (muddy midpoints).
// The grain layer is the single page-wide texture (feTurbulence, multiply).
// =============================================================================

const SECTION_STOCKS: Record<string, string> = {
  hero: "bone",
  about: "bone",
  experience: "cool",
  work: "blush",
  stack: "flax",
  presence: "celadon",
  contact: "bone",
};

export default function BackdropCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // rootMargin -50%/-50% collapses the observation band to the viewport
    // midline: exactly one section is ever "dominant", so the stock snaps
    // once per crossing — no edge flicker on slow scrolls.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && canvasRef.current) {
            canvasRef.current.dataset.stock =
              SECTION_STOCKS[entry.target.id] ?? "bone";
          }
        });
      },
      { rootMargin: "-50% 0% -50% 0%" }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
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
