"use client";

import { motion } from "motion/react";
import { useScrollLinkedIndex } from "@/hooks/useScrollLinkedIndex";
import { landingProjects } from "@/data/landing";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { renderIcon } from "@/lib/utils";
import Tag from "@/components/ui/Tag";
import WorkStackMeta from "./WorkStackMeta";
import WorkStackVisual from "./WorkStackVisual";
import styles from "./LandingFrame2WorkStack.module.css";

// =============================================================================
// LandingFrame2WorkStack — Selected-work frame.
// Uses sticky scroll on motion-capable layouts and a static card grid fallback
// when reduced motion is requested.
// =============================================================================

interface LandingFrame2WorkStackProps {
  staticMode?: boolean;
}

function ProjectCard({ project }: { project: (typeof landingProjects)[number] }) {
  return (
    <>
      <span className={styles.mobileCaseLabel}>Case {project.id}</span>
      <div className={styles.mobileIcon}>
        {renderIcon(project.icon, { size: 44, strokeWidth: 0.9 })}
      </div>
      <h3 className={styles.mobileTitle}>{project.title}</h3>
      <p className={styles.mobileDescription}>{project.shortDescription}</p>
      <div className={styles.mobileTags}>
        {project.tags.map((tag) => (
          <Tag key={tag} label={tag} variant="subtle" />
        ))}
      </div>
    </>
  );
}

export default function LandingFrame2WorkStack({
  staticMode = false,
}: LandingFrame2WorkStackProps) {
  const { containerRef, activeIndex, progress } = useScrollLinkedIndex({
    itemCount: landingProjects.length,
  });

  if (staticMode) {
    return (
      // Static mode preserves the same content and anchor target without any
      // sticky-scroll dependency, which keeps reduced-motion behavior reliable.
      <section
        id="selected-work"
        className={styles.staticSection}
        aria-label="Selected work"
      >
        <div className={styles.staticContainer}>
          <span className={styles.sectionLabel}>Selected Work</span>
          <div className={styles.staticGrid}>
            {landingProjects.map((project) => (
              <article key={project.id} className={styles.mobileCard}>
                <ProjectCard project={project} />
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Desktop/tablet sticky experience. The outer height creates scroll room. */}
      <div
        ref={containerRef}
        id="selected-work"
        className={styles.workStackOuter}
        style={{ height: `${landingProjects.length * 100}vh` }}
        aria-label="Selected work"
      >
        <div className={styles.workStackSticky}>
          <span className={styles.sectionLabel}>Selected Work</span>
          <div className={styles.workStackGrid}>
            <WorkStackMeta activeIndex={activeIndex} projects={landingProjects} />
            <WorkStackVisual
              activeIndex={activeIndex}
              projects={landingProjects}
            />
          </div>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              style={{ scaleX: progress }}
            />
          </div>
        </div>
      </div>

      {/* Mobile keeps the same project content but avoids sticky scroll entirely. */}
      <motion.div
        id="selected-work-mobile"
        className={styles.mobileList}
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <span className={styles.sectionLabel}>Selected Work</span>
        {landingProjects.map((project) => (
          <motion.div
            key={project.id}
            className={styles.mobileCard}
            variants={staggerItem}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
