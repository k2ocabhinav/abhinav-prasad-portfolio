"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCardTilt } from "@/hooks/useCardTilt";
import { renderIcon } from "@/lib/utils";
import { tiltSpring, workCardActive } from "@/lib/animations";
import styles from "./WorkStackVisual.module.css";

// =============================================================================
// WorkStackVisual — Visual counterpart to WorkStackMeta.
// Keeps icon transitions and hover lift inside Motion so transforms compose cleanly.
// =============================================================================

interface WorkStackVisualProject {
  id: string;
  icon: string;
}

interface WorkStackVisualProps {
  activeIndex: number;
  projects: WorkStackVisualProject[];
}

export default function WorkStackVisual({
  activeIndex,
  projects,
}: WorkStackVisualProps) {
  const { ref: tiltRef, tilt } = useCardTilt(8);
  const project = projects[activeIndex];

  return (
    <div className={styles.visual}>
      <motion.div
        ref={tiltRef}
        className={styles.card}
        variants={workCardActive}
        initial="inactive"
        animate="active"
        whileHover={{ y: -8 }}
        transition={tiltSpring}
        style={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          transformPerspective: 1200,
        }}
      >
        <div className={styles.dotOverlay} />
        {/* Icon content is the only part that swaps; the glass card stays stable. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={project.id}
            className={styles.iconWrapper}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {renderIcon(project.icon, {
              size: 120,
              strokeWidth: 0.5,
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
