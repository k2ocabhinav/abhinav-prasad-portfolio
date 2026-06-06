"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { SectionBlendStyle, SectionTone } from "@/types";
import { personal } from "@/data/personal";
import { presenceNodes } from "@/data/presence";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import LiveClock from "@/components/ui/LiveClock";
import SectionWrapper from "@/components/ui/SectionWrapper";
import FlipRevealText from "@/components/ui/FlipRevealText";
import styles from "./PresenceSection.module.css";

// =============================================================================
// PresenceSection — Abstract map with pulsing nodes and live clock
// =============================================================================

interface PresenceSectionProps {
  tone?: SectionTone;
  blendTopFrom?: SectionTone;
  blendBottomTo?: SectionTone;
  blendStyle?: SectionBlendStyle;
}

export default function PresenceSection({
  tone,
}: PresenceSectionProps) {
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
      id="presence"
      tone={tone}
    >
      <div ref={sectionRef} className={`grid-12 ${styles.presenceGrid}`}>
        <div className="col-4">
          <motion.h2 style={{ y: prefersReducedMotion ? 0 : headingY }} className={styles.heading}>
            <FlipRevealText
              text="Presence"
              mode="char"
              progress={scrollYProgress}
              window={[0.16, 0.3]}
              holdUntil={0.84}
              stagger={0.028}
              perspective={900}
              className={styles.headingFlip}
              tokenClassName={styles.headingFlipToken}
            />
          </motion.h2>
          <motion.p className={styles.callout} style={{ y: prefersReducedMotion ? 0 : calloutY }}>
            <FlipRevealText
              text="Signals across time zones."
              mode="word"
              progress={scrollYProgress}
              window={[0.24, 0.38]}
              holdUntil={0.8}
              stagger={0.03}
              perspective={860}
              className={styles.calloutFlip}
              tokenClassName={styles.calloutFlipToken}
            />
          </motion.p>
          <div className={styles.clockWrapper}>
            <LiveClock
              city={personal.location.city}
              countryCode={personal.location.countryCode}
              timezone={personal.location.timezone}
            />
          </div>
        </div>
        <div className="col-8">
          {/* Map Area */}
          <div className={styles.mapContainer}>
            <div className={`dot-grid ${styles.mapDotGrid}`} />

            {presenceNodes.map((node, i) => (
              <div
                key={i}
                className={styles.mapNode}
                style={{ top: node.top, left: node.left }}
              >
                <div className={styles.nodeCenter}>
                  {node.active && !prefersReducedMotion && (
                    <motion.div
                      animate={{
                        scale: [1, 2, 1],
                        opacity: [0.3, 0.1, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i,
                      }}
                      className={styles.nodePulse}
                    />
                  )}
                  <div
                    className={`${styles.nodeDot} ${node.active ? styles.nodeDotActive : styles.nodeDotInactive}`}
                  />
                  <div className={styles.nodeLabels}>
                    <span className={styles.nodeLabel}>{node.label}</span>
                    {node.sub && (
                      <span className={styles.nodeSub}>{node.sub}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className={styles.description}>
            {personal.presenceDescription}
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
