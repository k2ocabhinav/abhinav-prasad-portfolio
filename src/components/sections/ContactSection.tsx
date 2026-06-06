"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Mail } from "lucide-react";
import type { SectionBlendStyle, SectionTone } from "@/types";
import { personal } from "@/data/personal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import MagneticButton from "@/components/ui/MagneticButton";
import SectionWrapper from "@/components/ui/SectionWrapper";
import FlipRevealText from "@/components/ui/FlipRevealText";
import styles from "./ContactSection.module.css";

// =============================================================================
// ContactSection — CTA with resume download, email, and social links
// =============================================================================

// Brand SVG icons (removed from lucide-react v1.7+)
function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const socialIcons: Record<string, React.ReactNode> = {
  github: <GithubIcon size={20} />,
  linkedin: <LinkedinIcon size={20} />,
  email: <Mail size={20} />,
};

interface ContactSectionProps {
  tone?: SectionTone;
  blendTopFrom?: SectionTone;
  blendBottomTo?: SectionTone;
  blendStyle?: SectionBlendStyle;
}

export default function ContactSection({
  tone,
}: ContactSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: prefersReducedMotion ? undefined : sectionRef,
    offset: ["start end", "end start"],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const calloutY = useTransform(scrollYProgress, [0, 1], [12, -10]);
  const primaryCtaHref =
    personal.resumeHref ?? `mailto:${personal.email}?subject=Request%20Resume`;
  const primaryCtaLabel = personal.resumeHref ? "Download Resume" : "Request Resume";

  return (
    <SectionWrapper
      id="contact"
      tone={tone}
      texture="ruled"
      fullHeight
      centered
    >
      <div className={cn("spec-sheet", styles.contactSpecSheet)}>
        <div className="spec-header">
          <span>SPEC-02 // ROUTING_GATEWAY</span>
          <span>STATUS: ONLINE</span>
        </div>
        <div ref={sectionRef} className={cn("spec-body", styles.contactMotionRoot)}>
          <motion.h2
            style={{ y: prefersReducedMotion ? 0 : headingY }}
            className={styles.heading}
          >
            <FlipRevealText
              text="Let's build."
              mode="char"
              progress={scrollYProgress}
              window={[0.16, 0.3]}
              holdUntil={0.84}
              stagger={0.028}
              perspective={910}
              className={styles.headingFlip}
              tokenClassName={styles.headingFlipToken}
            />
          </motion.h2>
          <motion.p className={styles.callout} style={{ y: prefersReducedMotion ? 0 : calloutY }}>
            <FlipRevealText
              text="From idea to shipped system."
              mode="word"
              progress={scrollYProgress}
              window={[0.24, 0.4]}
              holdUntil={0.82}
              stagger={0.03}
              perspective={860}
              className={styles.calloutFlip}
              tokenClassName={styles.calloutFlipToken}
            />
          </motion.p>

          <div className={styles.ctaContainer}>
            <MagneticButton
              href={primaryCtaHref}
              download={Boolean(personal.resumeHref)}
            >
              {primaryCtaLabel}
            </MagneticButton>

            <div className={styles.contactLinks}>
              <a href={`mailto:${personal.email}`} className={styles.emailLink}>
                {personal.email}
              </a>
              <div className={styles.socials}>
                {personal.socials.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      social.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    whileHover={prefersReducedMotion ? undefined : { y: -5 }}
                    aria-label={social.label}
                    className={styles.socialIcon}
                  >
                    {socialIcons[social.platform]}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer tagline */}
          <div className={styles.footerTagline}>
            <p className={styles.taglineText}>{personal.footerTagline}</p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
