"use client";

import { motion } from "motion/react";
import { experiences } from "@/data/experience";
import { staggerContainer, staggerItem } from "@/lib/animations";
import Tag from "@/components/ui/Tag";
import SectionWrapper from "@/components/ui/SectionWrapper";
import styles from "./ExperienceSection.module.css";

// =============================================================================
// ExperienceSection — Timeline with staggered entry animations
// =============================================================================

export default function ExperienceSection() {
  return (
    <SectionWrapper id="experience">
      <div className={`grid-12 ${styles.experienceGrid}`}>
        <div className="col-4">
          <h2 className={styles.heading}>Chronicle</h2>
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
            {experiences.map((exp, i) => (
              <motion.div
                key={i}
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
