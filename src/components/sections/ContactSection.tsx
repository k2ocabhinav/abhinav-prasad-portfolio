"use client";

import * as m from "motion/react-m";
import { useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Mail } from "lucide-react";
import type { PersonalData, PresenceNode } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import MagneticButton from "@/components/ui/MagneticButton";
import SectionWrapper from "@/components/ui/SectionWrapper";
import EnvelopeStamp from "@/components/art/EnvelopeStamp";
import TimezoneMap from "@/components/art/TimezoneMap";
import styles from "./ContactSection.module.css";

interface ContactSectionProps {
  personal: PersonalData;
  presenceNodes: PresenceNode[];
}

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const socialIcons: Record<string, React.ReactNode> = {
  github: <GithubIcon size={20} />,
  linkedin: <LinkedinIcon size={20} />,
  email: <Mail size={20} aria-hidden="true" focusable="false" />,
};

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
  const riseRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: prefersReducedMotion ? undefined : riseRef,
    offset: ["start end", "start 0.55"],
  });
  const sheetY = useTransform(scrollYProgress, [0, 1], [32, 0]);
  const sheetScale = useTransform(scrollYProgress, [0, 1], [0.98, 1]);

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
                y: prefersReducedMotion ? 0 : sheetY,
                scale: prefersReducedMotion ? 1 : sheetScale,
              }}
            >
              <div className={cn("spec-body", styles.contactMotionRoot)}>
                <h2 className={styles.heading}>Let&apos;s talk.</h2>
                <p className={styles.callout}>For software roles, product work or a project question.</p>

                <div className={styles.ctaContainer}>
                  <MagneticButton href={personal.resumeHref} download>
                    Download résumé
                  </MagneticButton>

                  <div className={styles.contactLinks}>
                    <EnvelopeStamp />
                    <div className={styles.contactInfo}>
                      <a href={`mailto:${personal.email}`} className={styles.emailLink}>
                        {renderBreakableEmail(personal.email)}
                      </a>
                      <div className={styles.socials}>
                        {personal.socials.map((social) => (
                          <m.a
                            key={social.platform}
                            href={social.href}
                            target={social.href.startsWith("http") ? "_blank" : undefined}
                            rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            whileHover={prefersReducedMotion ? undefined : { y: -5 }}
                            aria-label={social.label}
                            className={styles.socialIcon}
                          >
                            {socialIcons[social.platform]}
                          </m.a>
                        ))}
                      </div>
                    </div>
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
