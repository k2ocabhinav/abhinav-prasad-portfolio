"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { personal } from "@/data/personal";
import { useSectionInView } from "@/hooks/useSectionInView";
import SectionWrapper from "@/components/ui/SectionWrapper";
import styles from "./AboutSection.module.css";

// =============================================================================
// AboutSection — Philosophy statement in asymmetric grid
// =============================================================================

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const { isInView } = useSectionInView(sectionRef);

  return (
    <SectionWrapper id="about">
      <div ref={sectionRef} className={`grid-12 ${styles.aboutGrid}`}>
        <div className="col-4">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ y: headingY }}
            className={styles.heading}
          >
            Philosophy
          </motion.h2>
        </div>
        <div className={`col-8 ${styles.contentCol}`}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          >
            <p className={styles.philosophyText}>{personal.philosophy}</p>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
