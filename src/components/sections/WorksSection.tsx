"use client";

import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { projects } from "@/data/projects";
import { useCardTilt } from "@/hooks/useCardTilt";
import { staggerContainer, staggerItem, tiltSpring } from "@/lib/animations";
import { resolveIcon, cn } from "@/lib/utils";
import Tag from "@/components/ui/Tag";
import SectionWrapper from "@/components/ui/SectionWrapper";
import styles from "./WorksSection.module.css";

// =============================================================================
// WorksSection — Project showcase with alternating layouts and card tilt
// =============================================================================

export default function WorksSection() {
  return (
    <SectionWrapper id="work">
      <div className={styles.sectionHeader}>
        <h2 className={styles.heading}>Selected Works</h2>
      </div>

      <motion.div
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className={styles.projectsList}
      >
        {projects.map((project, i) => (
          <WorkCard key={i} project={project} />
        ))}
      </motion.div>
    </SectionWrapper>
  );
}

// ─── WorkCard Sub-component ─────────────────────────────────────────

function WorkCard({ project }: { project: (typeof projects)[number] }) {
  const { ref: tiltRef, tilt } = useCardTilt();
  const IconComponent = resolveIcon(project.icon);

  return (
    <motion.div variants={staggerItem} className={styles.workCard}>
      {/* Visual Panel */}
      <motion.div
        ref={tiltRef}
        animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
        transition={tiltSpring}
        style={{ transformPerspective: 800 }}
        className={cn(
          styles.visualPanel,
          "glass-card",
          project.reversed && styles.visualReversed
        )}
      >
        <div className={`dot-grid ${styles.dotOverlay}`} />
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={styles.iconWrapper}
        >
          <IconComponent
            size={48}
            style={{ color: "rgba(107, 127, 120, 0.4)" }}
          />
        </motion.div>
      </motion.div>

      {/* Content Panel */}
      <div
        className={cn(
          styles.contentPanel,
          project.reversed && styles.contentReversed
        )}
      >
        <span className={styles.caseNumber}>Case {project.id}</span>
        <h3 className={styles.projectTitle}>{project.title}</h3>
        <p className={styles.projectDesc}>{project.description}</p>
        {project.tags.length > 0 && (
          <div className={styles.projectTags}>
            {project.tags.map((tag) => (
              <Tag key={tag} label={tag} variant="subtle" />
            ))}
          </div>
        )}
        <span className={styles.caseStudyLink} title="Coming soon">
          View Case Study <ChevronRight size={18} />
        </span>
      </div>
    </motion.div>
  );
}
