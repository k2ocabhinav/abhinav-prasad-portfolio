"use client";

import { motion } from "motion/react";
import { personal } from "@/data/personal";
import { fadeInLeft, fadeInUp } from "@/lib/animations";
import SectionWrapper from "@/components/ui/SectionWrapper";
import styles from "./AboutSection.module.css";

// =============================================================================
// AboutSection — Philosophy statement in asymmetric grid
// =============================================================================

export default function AboutSection() {
  return (
    <SectionWrapper id="about">
      <div className={`grid-12 ${styles.aboutGrid}`}>
        <div className="col-4">
          <motion.h2
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={styles.heading}
          >
            Philosophy
          </motion.h2>
        </div>
        <div className={`col-8 ${styles.contentCol}`}>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className={styles.philosophyText}>{personal.philosophy}</p>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
