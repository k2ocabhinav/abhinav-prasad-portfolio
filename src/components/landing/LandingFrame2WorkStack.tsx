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

export default function LandingFrame2WorkStack() {
  const { containerRef, activeIndex, progress } = useScrollLinkedIndex({
    itemCount: landingProjects.length,
  });

  return (
    <>
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

      <motion.div
        className={styles.mobileList}
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {landingProjects.map((project) => (
          <motion.div
            key={project.id}
            className={styles.mobileCard}
            variants={staggerItem}
          >
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
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
