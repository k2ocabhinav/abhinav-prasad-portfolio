"use client";

import * as m from "motion/react-m";
import { useScroll, useTransform } from "motion/react";
import { useRef, useSyncExternalStore } from "react";
import type { PersonalData, PresenceNode } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import LinkedInMark from "@/components/ui/LinkedInMark";
import MagneticButton from "@/components/ui/MagneticButton";
import SectionWrapper from "@/components/ui/SectionWrapper";
import EnvelopeStamp from "@/components/art/EnvelopeStamp";
import TimezoneMap from "@/components/art/TimezoneMap";
import styles from "./ContactSection.module.css";

function subscribeToHydration() {
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}

interface ContactSectionProps {
  personal: PersonalData;
  presenceNodes: PresenceNode[];
}

// Keep the address unbroken while it fits, but give the browser break points
// only after "@" and "." so it can never split a word.
function renderBreakableEmail(email: string): React.ReactNode {
  return Array.from(email).flatMap((character, index) => {
    const node: React.ReactNode = character;
    return character === "@" || character === "."
      ? [node, <wbr key={`break-${index}`} />]
      : [node];
  });
}

export default function ContactSection({
  personal,
  presenceNodes,
}: ContactSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const hasMounted = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot
  );
  const riseRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: prefersReducedMotion ? undefined : riseRef,
    offset: ["start end", "start 0.55"],
  });
  const sheetY = useTransform(scrollYProgress, [0, 1], [32, 0]);
  const sheetScale = useTransform(scrollYProgress, [0, 1], [0.98, 1]);
  const linkedinHref = personal.socials.find(
    (social) => social.platform === "linkedin"
  )?.href;

  return (
    <SectionWrapper id="contact" className={styles.contactSection}>
      <div className={styles.contactScene}>
        <div className={styles.trimMarks} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className={styles.contactComposition}>
          <div className={styles.presenceBlock}>
            <div className={styles.mapContainer} aria-hidden="true">
              <TimezoneMap />
              {presenceNodes.map((node) => (
                <span
                  key={`${node.label}-${node.top}-${node.left}`}
                  className={cn(
                    styles.mapNode,
                    node.active ? styles.mapNodeActive : styles.mapNodeInactive
                  )}
                  style={{ top: node.top, left: node.left }}
                />
              ))}
            </div>
            <p className={styles.location}>
              {personal.location.city}, {personal.location.country}
            </p>
            <p className={styles.presenceDescription}>
              {personal.presenceDescription}
            </p>
          </div>

          <div ref={riseRef}>
            <m.div
              className={cn("spec-sheet", styles.contactSpecSheet)}
              style={{
                y: !hasMounted || prefersReducedMotion ? 0 : sheetY,
                scale: !hasMounted || prefersReducedMotion ? 1 : sheetScale,
              }}
            >
              <div className={cn("spec-body", styles.contactMotionRoot)}>
                <h2 className={styles.heading}>Let&apos;s talk.</h2>
                <p className={styles.callout}>Full-time roles, contract work or a scoped project: all welcome.</p>

                <div className={styles.ctaContainer}>
                  <div className={styles.contactLinks}>
                    <EnvelopeStamp />
                    <div className={styles.contactInfo}>
                      <a
                        href={`mailto:${personal.email}`}
                        className={styles.emailLink}
                        aria-label={personal.email}
                      >
                        {renderBreakableEmail(personal.email)}
                      </a>
                    </div>
                  </div>

                  <div className={styles.contactActions}>
                    {linkedinHref ? (
                      <MagneticButton
                        href={linkedinHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="glow"
                        className={cn(
                          styles.contactAction,
                          styles.linkedinAction
                        )}
                      >
                        <LinkedInMark size={16} />
                        Connect on LinkedIn
                      </MagneticButton>
                    ) : null}
                    <MagneticButton
                      href={personal.resumeHref}
                      download
                      className={styles.contactAction}
                    >
                      Download résumé
                    </MagneticButton>
                  </div>
                </div>

                <div className={styles.footerTagline}>
                  <p className={styles.taglineText}>{personal.footerTagline}</p>
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
