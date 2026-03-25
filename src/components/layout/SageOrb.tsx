"use client";

import { motion } from "motion/react";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { sections } from "@/data/navigation";
import { orbSpring } from "@/lib/animations";
import styles from "./SageOrb.module.css";

// =============================================================================
// SageOrb — Mouse-following orb, scales up on contact section
// =============================================================================

export default function SageOrb() {
  const mousePos = useMousePosition();
  const sectionIds = sections.map((s) => s.id);
  const activeSection = useScrollSpy(sectionIds);

  const isContact = activeSection === "contact";

  return (
    <motion.div
      className={styles.orb}
      animate={{
        x: mousePos.x - 16,
        y: mousePos.y - 16,
        scale: isContact ? 2.5 : 1,
        opacity: isContact ? 0.5 : 0.8,
      }}
      transition={orbSpring}
    />
  );
}
