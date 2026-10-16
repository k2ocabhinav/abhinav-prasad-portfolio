"use client";

import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import type { PersonalData, PresenceNode, SectionTone } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import LiveClock from "@/components/ui/LiveClock";
import SectionWrapper from "@/components/ui/SectionWrapper";
import TimezoneMap from "@/components/art/TimezoneMap";
import styles from "./PresenceSection.module.css";

// =============================================================================
// PresenceSection — Abstract map with pulsing nodes and live clock
// =============================================================================

interface PresenceSectionProps {
  personal: PersonalData;
  presenceNodes: PresenceNode[];
  tone?: SectionTone;
}

export default function PresenceSection({
  personal,
  presenceNodes,
  tone,
}: PresenceSectionProps) {
  if (presenceNodes.length === 0) {
    return null;
  }

  return (
    <PresenceSectionContent
      personal={personal}
      presenceNodes={presenceNodes}
      tone={tone}
    />
  );
}

function PresenceSectionContent({
  personal,
  presenceNodes,
  tone,
}: PresenceSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isSectionActive, setIsSectionActive] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionActive(entry.isIntersecting);
      },
      { rootMargin: "140px 0px", threshold: 0.08 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  return (
    <SectionWrapper
      id="presence"
      tone={tone}
      className={styles.presenceSection}
    >
      <div
        ref={sectionRef}
        className={`grid-12 ${styles.presenceGrid}`}
        data-presence-active={isSectionActive ? "true" : "false"}
      >
        <div className="col-4">
          <h2 className={styles.heading}>
            Presence
          </h2>
          <p className={styles.callout}>
            Signals across time zones
          </p>
          <div className={styles.clockWrapper}>
            <LiveClock
              city={personal.location.city}
              countryCode={personal.location.countryCode}
              timezone={personal.location.timezone}
            />
          </div>
          <p className={styles.description}>
            {personal.presenceDescription}
          </p>
        </div>
        <div className="col-8">
          {/* Map Area */}
          <div className={styles.mapContainer}>
            <TimezoneMap />

            {presenceNodes.map((node, i) => (
              <div
                key={i}
                className={`${styles.mapNode} ${i === 0 ? styles.mapNodeUpper : styles.mapNodeLower}`}
                style={{ top: node.top, left: node.left }}
              >
                <div className={styles.nodeCenter}>
                  {node.active && !prefersReducedMotion && isSectionActive && (
                    <m.div
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
        </div>
      </div>
    </SectionWrapper>
  );
}
