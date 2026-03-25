"use client";

import { motion } from "motion/react";
import { personal } from "@/data/personal";
import { presenceNodes } from "@/data/presence";
import LiveClock from "@/components/ui/LiveClock";
import SectionWrapper from "@/components/ui/SectionWrapper";
import styles from "./PresenceSection.module.css";

// =============================================================================
// PresenceSection — Abstract map with pulsing nodes and live clock
// =============================================================================

export default function PresenceSection() {
  return (
    <SectionWrapper id="presence">
      <div className="grid-12">
        <div className="col-4">
          <h2 className={styles.heading}>Presence</h2>
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
                  {node.active && (
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
