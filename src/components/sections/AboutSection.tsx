"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { SectionBlendStyle, SectionTone } from "@/types";
import { personal } from "@/data/personal";
import SectionWrapper from "@/components/ui/SectionWrapper";
import FlipRevealText from "@/components/ui/FlipRevealText";
import styles from "./AboutSection.module.css";

// =============================================================================
// AboutSection — Philosophy statement in asymmetric grid
// =============================================================================

interface AboutSectionProps {
  tone?: SectionTone;
  blendTopFrom?: SectionTone;
  blendBottomTo?: SectionTone;
  blendStyle?: SectionBlendStyle;
}

export default function AboutSection({
  tone,
  blendTopFrom,
  blendBottomTo,
  blendStyle,
}: AboutSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <SectionWrapper
      id="about"
      tone={tone}
      blendTopFrom={blendTopFrom}
      blendBottomTo={blendBottomTo}
      blendStyle={blendStyle}
    >
      <div ref={sectionRef} className={`grid-12 ${styles.aboutGrid}`}>
        <div className="col-4">
          <motion.h2
            style={{ y: headingY }}
            className={styles.heading}
          >
            <FlipRevealText
              text="Philosophy"
              mode="char"
              progress={scrollYProgress}
              window={[0.2, 0.34]}
              holdUntil={0.86}
              stagger={0.028}
              perspective={980}
              className={styles.headingFlip}
              tokenClassName={styles.headingFlipToken}
            />
          </motion.h2>
        </div>
        <div className={`col-8 ${styles.contentCol}`}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          >
            <p className={styles.philosophyText}>{personal.philosophy}</p>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
