"use client";

import PrintRunPoster from "@/components/art/PrintRunPoster";
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
  return (
    <section
      className={styles.blend}
      data-home-explore-bridge="true"
      data-reduced-motion={reduceMotion ? "true" : "false"}
      aria-label="Personal layer"
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>{content.eyebrow}</span>
          <h2 className={styles.label}>{content.title}</h2>
        </div>
        <div className={styles.posterColumn}>
          <PrintRunPoster />
        </div>
      </div>
    </section>
  );
}
