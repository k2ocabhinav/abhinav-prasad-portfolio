import type { PersonalData, PresenceNode } from "@/types";
import { cn } from "@/lib/utils";
import LinkedInMark from "@/components/ui/LinkedInMark";
import MagneticButton from "@/components/ui/MagneticButton";
import SectionWrapper from "@/components/ui/SectionWrapper";
import RevealText from "@/components/motion/RevealText";
import EnvelopeStamp from "@/components/art/EnvelopeStamp";
import TimezoneMap from "@/components/art/TimezoneMap";
import styles from "./ContactSection.module.css";

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
  const linkedinHref = personal.socials.find(
    (social) => social.platform === "linkedin"
  )?.href;

  return (
    <SectionWrapper id="contact" className={styles.contactSection}>
      <div className={styles.contactScene}>
        <RevealText as="h2" text="Let's talk." className={styles.heading} />

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

          <div className={cn("spec-sheet", styles.contactSpecSheet)}>
            <p className={styles.callout}>
              Full-time roles, contract work or a scoped project: all welcome.
            </p>

            <div className={styles.contactLinks}>
              <EnvelopeStamp />
              <a
                href={`mailto:${personal.email}`}
                className={styles.emailLink}
                data-contact-email="true"
                aria-label={personal.email}
              >
                {renderBreakableEmail(personal.email)}
              </a>
            </div>

            <div className={styles.contactActions}>
              {linkedinHref ? (
                <MagneticButton
                  href={linkedinHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="glow"
                  className={cn(styles.contactAction, styles.linkedinAction)}
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
        </div>
      </div>
    </SectionWrapper>
  );
}
