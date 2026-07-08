"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import FlipRevealText from "@/components/ui/FlipRevealText";
import styles from "./LandingBlendSection.module.css";

// =============================================================================
// LandingBlendSection — Visual bridge between the landing sequence and the
// preserved portfolio sections below. Decorative only.
// =============================================================================

export default function LandingBlendSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const labelY = useTransform(scrollYProgress, [0, 0.5, 1], [22, 0, -18]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.25, 1, 1, 0.45]);

  return (
    <section
      ref={sectionRef}
      className={styles.blend}
      data-home-explore-bridge="true"
      aria-label="Personal layer"
    >
      <div className={styles.inner}>
        <span className={styles.eyebrow}>Identity Layer</span>
        <motion.p className={styles.label} style={{ opacity: labelOpacity, y: labelY }}>
          <FlipRevealText flat
            text="Beyond the Build"
            mode="word"
            progress={scrollYProgress}
            window={[0.12, 0.28]}
            holdUntil={0.8}
            stagger={0.03}
            perspective={920}
          />
        </motion.p>
      </div>
    </section>
  );
}
