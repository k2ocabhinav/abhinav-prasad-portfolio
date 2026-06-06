"use client";

import { motion } from "motion/react";
import Tag from "@/components/ui/Tag";
import styles from "./WorkStackMeta.module.css";

// =============================================================================
// WorkStackMeta — Content panel for the sticky Featured Work case reel.
// Swaps the active story details as scroll-linked state changes.
// =============================================================================

interface WorkStackMetaStory {
  id: string;
  eyebrow: string;
  title: string;
  claim: string;
  summary: string;
  tags: string[];
  note: string;
  projectCodeTone: "lime" | "ember" | "split";
  proofBeats: {
    label: "Problem" | "My Role" | "Shipped" | "Impact";
    short: string;
    detail: string;
  }[];
}

interface WorkStackMetaProps {
  activeIndex: number;
  activeBeatIndex: number;
  stories: WorkStackMetaStory[];
}

export default function WorkStackMeta({
  activeIndex,
  activeBeatIndex,
  stories,
}: WorkStackMetaProps) {
  const story = stories[activeIndex];
  const proofBeat =
    story.proofBeats[Math.min(activeBeatIndex, story.proofBeats.length - 1)];

  return (
    <div className={styles.meta} data-code-tone={story.projectCodeTone}>
      <span className={styles.metaHeading}>Featured Work</span>
      <motion.div
        key={story.id}
        className={styles.caseSwitch}
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.projectNumber} aria-hidden="true">
          {story.id}
        </div>
        <p className={styles.projectEyebrow}>{story.eyebrow}</p>
        <h3 className={styles.projectClaim}>{story.claim}</h3>
        <p className={styles.projectTitle}>{story.title}</p>
        <p className={styles.projectDescription}>{story.summary}</p>

        <dl className={styles.proofTicker} aria-live="polite">
          <div className={styles.proofTickerMeta} aria-hidden="true">
            <span>{String(activeBeatIndex + 1).padStart(2, "0")}</span>
            <span>{String(story.proofBeats.length).padStart(2, "0")}</span>
          </div>
          <motion.div
            key={`${story.id}-${proofBeat.label}`}
            className={styles.proofBeat}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <dt className={styles.proofLabel}>{proofBeat.label}</dt>
            <dd className={styles.proofShort}>{proofBeat.short}</dd>
            <dd className={styles.proofDetail}>{proofBeat.detail}</dd>
          </motion.div>
        </dl>

        <div className={styles.beatRail} aria-hidden="true">
          {story.proofBeats.map((beat, index) => (
            <span
              key={beat.label}
              className={styles.beatDot}
              data-active={index === activeBeatIndex ? "true" : "false"}
            />
          ))}
        </div>

        <div className={styles.tags}>
          <span className={styles.techLabel}>Tech</span>
          {story.tags.map((tag) => (
            <Tag key={tag} label={tag} variant="subtle" />
          ))}
        </div>
        <p className={styles.storyNote}>{story.note}</p>
      </motion.div>
    </div>
  );
}
