"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { ChronicleEntry, SectionBlendStyle, SectionTone } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import Tag from "@/components/ui/Tag";
import SectionWrapper from "@/components/ui/SectionWrapper";
import FlipRevealText from "@/components/ui/FlipRevealText";
import styles from "./ExperienceSection.module.css";

// =============================================================================
// ExperienceSection — Timeline with staggered entry animations
// =============================================================================

interface ExperienceSectionProps {
  experiences: ChronicleEntry[];
  tone?: SectionTone;
  blendTopFrom?: SectionTone;
  blendBottomTo?: SectionTone;
  blendStyle?: SectionBlendStyle;
}

export default function ExperienceSection({
  experiences,
  tone,
}: ExperienceSectionProps) {
  if (experiences.length === 0) {
    return null;
  }

  return <ExperienceSectionContent experiences={experiences} tone={tone} />;
}

function ExperienceSectionContent({
  experiences,
  tone,
}: ExperienceSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: prefersReducedMotion ? undefined : sectionRef,
    offset: ["start end", "end start"],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const calloutY = useTransform(scrollYProgress, [0, 1], [12, -10]);

  return (
    <SectionWrapper
      id="experience"
      tone={tone}
    >
      <div ref={sectionRef} className={`grid-12 ${styles.experienceGrid}`}>
        <div className="col-4">
          <motion.h2
            style={{ y: prefersReducedMotion ? 0 : headingY }}
            className={styles.heading}
          >
            <FlipRevealText flat
              text="Experience"
              mode="char"
              progress={scrollYProgress}
              window={[0.16, 0.3]}
              holdUntil={0.86}
              stagger={0.028}
              perspective={910}
              className={styles.headingFlip}
              tokenClassName={styles.headingFlipToken}
            />
          </motion.h2>
          <motion.p className={styles.callout} style={{ y: prefersReducedMotion ? 0 : calloutY }}>
            <FlipRevealText flat
              text="(02) — Built to stay resilient"
              mode="word"
              progress={scrollYProgress}
              window={[0.24, 0.38]}
              holdUntil={0.82}
              stagger={0.03}
              perspective={860}
              className={styles.calloutFlip}
              tokenClassName={styles.calloutFlipToken}
            />
          </motion.p>
        </div>
        <div className={`col-8 ${styles.timelineCol}`}>
          {/* Timeline line */}
          <div className={styles.timelineLine} />

          <motion.div
            variants={staggerContainer(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={styles.entries}
          >
            {experiences.map((exp) => (
              <motion.div
                key={exp.slug}
                variants={staggerItem}
                className={styles.entry}
              >
                <div className={styles.timelineDot} />
                <span className={styles.date}>{exp.date}</span>
                <h3 className={styles.role}>{exp.title}</h3>
                <p className={styles.company}>{exp.company}</p>
                <div className={styles.tags}>
                  {exp.tags.map((tag) => (
                    <Tag key={tag} label={tag} />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
