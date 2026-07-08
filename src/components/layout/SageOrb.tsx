"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { sections } from "@/data/navigation";
import { orbSpring } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./SageOrb.module.css";

// =============================================================================
// SageOrb — Mouse-following orb, scales up on contact section
// =============================================================================

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

// Matte cursor dot: ink everywhere, vermilion only on the contact section.
const ORB_ACCENTS: Record<string, { hex: string; rgb: string }> = {
  hero: { hex: "#0B1011", rgb: "11, 16, 17" },
  about: { hex: "#0B1011", rgb: "11, 16, 17" },
  experience: { hex: "#0B1011", rgb: "11, 16, 17" },
  work: { hex: "#0B1011", rgb: "11, 16, 17" },
  stack: { hex: "#0B1011", rgb: "11, 16, 17" },
  presence: { hex: "#0B1011", rgb: "11, 16, 17" },
  contact: { hex: "#E42A1D", rgb: "228, 42, 29" },
};

export default function SageOrb() {
  const prefersReducedMotion = useReducedMotion();
  const sectionIds = useMemo(() => sections.map((s) => s.id), []);
  const emptySectionIds = useMemo<string[]>(() => [], []);
  const [canTrackPointer, setCanTrackPointer] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const pointerQuery = window.matchMedia("(pointer: fine) and (min-width: 768px)");
    const saveData = Boolean(
      (navigator as NavigatorWithConnection).connection?.saveData
    );
    const updateTracking = () => {
      setCanTrackPointer(pointerQuery.matches && !saveData);
    };
    const frameId = window.requestAnimationFrame(updateTracking);

    pointerQuery.addEventListener("change", updateTracking);

    return () => {
      window.cancelAnimationFrame(frameId);
      pointerQuery.removeEventListener("change", updateTracking);
    };
  }, [prefersReducedMotion]);

  const pointerTrackingEnabled = canTrackPointer && !prefersReducedMotion;
  const mousePos = useMousePosition(pointerTrackingEnabled);
  const activeSection = useScrollSpy(
    pointerTrackingEnabled ? sectionIds : emptySectionIds
  );

  const isContact = activeSection === "contact";
  const accent = ORB_ACCENTS[activeSection] ?? ORB_ACCENTS.hero;

  if (!pointerTrackingEnabled) {
    return null;
  }

  return (
    <motion.div
      className={styles.orb}
      style={
        {
          ["--orb-accent"]: accent.hex,
          ["--orb-accent-rgb"]: accent.rgb,
        } as CSSProperties
      }
      animate={{
        x: mousePos.x - 18,
        y: mousePos.y - 18,
        scale: isContact ? 2.35 : 1,
        opacity: isContact ? 0.6 : 0.92,
      }}
      transition={orbSpring}
    >
      <span className={styles.orbHalo} />
      <span className={styles.orbCore} />
      <span className={styles.orbRing} />
      <span className={styles.orbSpark} />
    </motion.div>
  );
}
