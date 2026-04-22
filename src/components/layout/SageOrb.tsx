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
        x: mousePos.x - 22,
        y: mousePos.y - 22,
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
