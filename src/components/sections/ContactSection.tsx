"use client";

import * as m from "motion/react-m";
import { useScroll, useTransform } from "motion/react";
import { useRef, useSyncExternalStore } from "react";
import type { PersonalData, PresenceNode } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import LinkedInMark from "@/components/ui/LinkedInMark";
import WhatsAppMark from "@/components/ui/WhatsAppMark";
import DownloadMark from "@/components/ui/DownloadMark";
import MagneticButton from "@/components/ui/MagneticButton";
import SectionWrapper from "@/components/ui/SectionWrapper";
import EnvelopeStamp from "@/components/art/EnvelopeStamp";
import TimezoneMap from "@/components/art/TimezoneMap";
import ContactEmail from "@/components/sections/contact/ContactEmail";
import LocalTime from "@/components/sections/contact/LocalTime";
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
  whatsappHref: string | null;
  presenceNodes: PresenceNode[];
}

export default function ContactSection({
  personal,
  whatsappHref,
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
              <LocalTime city={personal.location.city} />
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
              <div className={styles.contactMotionRoot}>
                <h2 className={styles.heading}>Let&apos;s build.</h2>
                <p className={styles.callout}>Full-time roles, contract work or a scoped project: all welcome.</p>

                <div className={styles.ctaContainer}>
                  <div className={styles.contactLinks}>
                    <EnvelopeStamp />
                    <div className={styles.contactInfo}>
                      <ContactEmail email={personal.email} />
                    </div>
                  </div>

                  <div className={styles.contactActions} data-contact-actions="true">
                    {linkedinHref ? (
                      <MagneticButton
                        href={linkedinHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        ariaLabel="Abhinav Prasad on LinkedIn (opens in a new tab)"
                        variant="outline"
                        className={styles.contactAction}
                      >
                        <LinkedInMark size={16} />
                        LinkedIn
                      </MagneticButton>
                    ) : null}
                    {whatsappHref ? (
                      <MagneticButton
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        ariaLabel="Message Abhinav on WhatsApp (opens in a new tab)"
                        variant="outline"
                        className={styles.contactAction}
                      >
                        <WhatsAppMark size={16} />
                        WhatsApp
                      </MagneticButton>
                    ) : null}
                    <MagneticButton
                      href={personal.resumeHref}
                      download
                      className={cn(styles.contactAction, styles.resumeAction)}
                    >
                      <DownloadMark size={16} />
                      Download résumé
                    </MagneticButton>
                  </div>
                </div>

                <div className={styles.footerTagline}>
                  <p className={styles.taglineText} data-contact-tagline="true">
                    {personal.footerTagline}
                  </p>
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
