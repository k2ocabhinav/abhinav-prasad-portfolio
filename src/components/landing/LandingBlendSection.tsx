"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import FlipRevealText from "@/components/ui/FlipRevealText";
import type { ProfileBridgeContent } from "@/types";
import styles from "./LandingBlendSection.module.css";

// =============================================================================
// LandingBlendSection — Visual bridge between the landing sequence and the
// preserved portfolio sections below. Decorative only.
// =============================================================================

interface LandingBlendSectionProps {
  content: ProfileBridgeContent;
  reduceMotion?: boolean;
}

export default function LandingBlendSection({
  content,
  reduceMotion = false,
}: LandingBlendSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const labelY = useTransform(scrollYProgress, [0, 0.5, 1], [22, 0, -18]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.2, 1], [0, 1, 1]);

  return (
    <section
      ref={sectionRef}
      className={styles.blend}
      data-home-explore-bridge="true"
      aria-label="Personal layer"
    >
      <div className={styles.inner}>
        <span className={styles.eyebrow}>{content.eyebrow}</span>
        <motion.h2
          className={styles.label}
          style={reduceMotion ? undefined : { opacity: labelOpacity, y: labelY }}
        >
          <FlipRevealText flat
            text={content.title}
            mode="word"
            progress={scrollYProgress}
            window={[0.12, 0.28]}
            holdUntil={0.8}
            persist
            stagger={0.03}
            perspective={920}
            reduceMotion={reduceMotion}
          />
        </motion.h2>
      </div>
    </section>
  );
}
