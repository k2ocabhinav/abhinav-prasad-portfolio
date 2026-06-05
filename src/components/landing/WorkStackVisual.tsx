"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCardTilt } from "@/hooks/useCardTilt";
import { getLandingAccentStyle, renderIcon } from "@/lib/utils";
import { tiltSpring, workCardActive } from "@/lib/animations";
import type { LandingAccentKey } from "@/types";
import styles from "./WorkStackVisual.module.css";

// =============================================================================
// WorkStackVisual — Visual counterpart to WorkStackMeta.
// Keeps icon transitions and hover lift inside Motion so transforms compose cleanly.
// =============================================================================

interface WorkStackVisualStory {
  id: string;
  icon: string;
  accent: LandingAccentKey;
}

interface WorkStackVisualProps {
  activeIndex: number;
  stories: WorkStackVisualStory[];
}

export default function WorkStackVisual({
  activeIndex,
  stories,
}: WorkStackVisualProps) {
  const { ref: tiltRef, tilt } = useCardTilt(4);
  const story = stories[activeIndex];

  return (
    <div className={styles.visual}>
      <motion.div
        ref={tiltRef}
        className={styles.card}
        style={{
          ...getLandingAccentStyle(story.accent),
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          transformPerspective: 1200,
        }}
        variants={workCardActive}
        initial="inactive"
        animate="active"
        whileHover={{ y: -3 }}
        transition={tiltSpring}
      >
        <div className={styles.dotOverlay} />
        {/* Icon content is the only part that swaps; the glass card stays stable. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={story.id}
            className={styles.iconWrapper}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {renderIcon(story.icon, {
              size: 120,
              strokeWidth: 0.5,
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
