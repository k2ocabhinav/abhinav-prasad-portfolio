"use client";

import { AnimatePresence, motion } from "motion/react";
import Tag from "@/components/ui/Tag";
import styles from "./WorkStackMeta.module.css";

// =============================================================================
// WorkStackMeta — Content panel for the sticky selected-work frame.
// Swaps the active project details as scroll-linked state changes.
// =============================================================================

interface WorkStackMetaProject {
  id: string;
  title: string;
  shortDescription: string;
  tags: string[];
  caseStudySlug: string | null;
}

interface WorkStackMetaProps {
  activeIndex: number;
  projects: WorkStackMetaProject[];
}

export default function WorkStackMeta({
  activeIndex,
  projects,
}: WorkStackMetaProps) {
  const project = projects[activeIndex];

  return (
    <div className={styles.meta}>
      {/* Wait mode prevents outgoing/incoming project copy from overlapping. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className={styles.projectNumber}>{project.id}</div>
          <h3 className={styles.projectTitle}>{project.title}</h3>
          <p className={styles.projectDescription}>{project.shortDescription}</p>
          <div className={styles.tags}>
            {project.tags.map((tag) => (
              <Tag key={tag} label={tag} variant="subtle" />
            ))}
          </div>
          {project.caseStudySlug ? (
            <a href={project.caseStudySlug} className={styles.caseStudyLink}>
              View Case Study
            </a>
          ) : (
            <span
              className={`${styles.caseStudyLink} ${styles.caseStudyDisabled}`}
            >
              Coming Soon
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
