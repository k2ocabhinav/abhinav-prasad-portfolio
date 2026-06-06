"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
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
  eyebrow: string;
  title: string;
  claim: string;
  icon: string;
  accent: LandingAccentKey;
  projectCodeTone: "lime" | "ember" | "split";
  proofBeats: {
    label: "Problem" | "My Role" | "Shipped" | "Impact";
    short: string;
    detail: string;
  }[];
  visual: {
    kind: "screenshot" | "system" | "type";
    src?: string;
    alt: string;
    caption: string;
  };
}

interface WorkStackVisualProps {
  activeIndex: number;
  activeBeatIndex: number;
  stories: WorkStackVisualStory[];
}

export default function WorkStackVisual({
  activeIndex,
  activeBeatIndex,
  stories,
}: WorkStackVisualProps) {
  const { ref: tiltRef, tilt } = useCardTilt(2);
  const story = stories[activeIndex];
  const activeBeat = story.proofBeats[Math.min(activeBeatIndex, story.proofBeats.length - 1)];

  return (
    <div className={styles.visual}>
      <motion.div
        ref={tiltRef}
        className={styles.card}
        data-code-tone={story.projectCodeTone}
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
        <div className={styles.scanSweep} aria-hidden="true" />
        <div className={styles.cardMeta} aria-hidden="true">
          <span>{story.eyebrow}</span>
          <strong>{story.id}</strong>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${story.id}-${activeBeat.label}`}
            className={styles.visualContent}
            initial={{ opacity: 0, y: 18, scale: 0.965 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 1.02 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            {story.visual.kind === "screenshot" && story.visual.src ? (
              <figure className={styles.screenshotFrame}>
                <Image
                  src={story.visual.src}
                  alt={story.visual.alt}
                  fill
                  sizes="(min-width: 1024px) 48vw, 90vw"
                  className={styles.screenshotImage}
                />
              </figure>
            ) : null}

            {story.visual.kind === "system" ? (
              <div className={styles.systemMap} aria-label={story.visual.alt}>
                <span className={`${styles.systemNode} ${styles.nodePrimary}`}>
                  {renderIcon(story.icon, { size: 44, strokeWidth: 0.8 })}
                </span>
                <span className={`${styles.systemNode} ${styles.nodeA}`} />
                <span className={`${styles.systemNode} ${styles.nodeB}`} />
                <span className={`${styles.systemNode} ${styles.nodeC}`} />
                <span className={styles.routeLine} />
                <span className={styles.routeLineAlt} />
              </div>
            ) : null}

            {story.visual.kind === "type" ? (
              <div className={styles.typePanel} aria-label={story.visual.alt}>
                <span>{story.claim}</span>
              </div>
            ) : null}

            <div className={styles.visualFooter}>
              <span>{story.visual.caption}</span>
              <strong>{activeBeat.label}</strong>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
