"use client";

import { AnimatePresence, motion } from "motion/react";
import Tag from "@/components/ui/Tag";
import styles from "./WorkStackMeta.module.css";

// =============================================================================
// WorkStackMeta — Content panel for the sticky story-vignette frame.
// Swaps the active story details as scroll-linked state changes.
// =============================================================================

interface WorkStackMetaStory {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  tags: string[];
  note: string;
}

interface WorkStackMetaProps {
  activeIndex: number;
  stories: WorkStackMetaStory[];
}

export default function WorkStackMeta({
  activeIndex,
  stories,
}: WorkStackMetaProps) {
  const story = stories[activeIndex];

  return (
    <div className={styles.meta}>
      <span className={styles.metaHeading}>How I Build</span>
      {/* Wait mode prevents outgoing/incoming story copy from overlapping. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={story.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className={styles.projectNumber}>{story.id}</div>
          <p className={styles.projectEyebrow}>{story.eyebrow}</p>
          <h3 className={styles.projectTitle}>{story.title}</h3>
          <p className={styles.projectDescription}>{story.summary}</p>
          <div className={styles.tags}>
            {story.tags.map((tag) => (
              <Tag key={tag} label={tag} variant="subtle" />
            ))}
          </div>
          <p className={styles.storyNote}>{story.note}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
