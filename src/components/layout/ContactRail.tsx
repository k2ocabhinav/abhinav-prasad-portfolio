import { FileText, Mail } from "lucide-react";
import LinkedInMark from "@/components/ui/LinkedInMark";
import { cn } from "@/lib/utils";
import styles from "./Navigation.module.css";

interface ContactRailProps {
  resumeHref: string;
  email: string;
  linkedinHref?: string;
  fullName: string;
}

// Static action rail for case-study routes. Section navigation only exists on
// the home page, so this renders the three contact actions without shipping
// the interactive navigation island.
export default function ContactRail({
  resumeHref,
  email,
  linkedinHref,
  fullName,
}: ContactRailProps) {
  return (
    <nav
      data-site-chrome="navigation-rail"
      aria-label="Contact navigation"
      className={cn(styles.desktopRail, styles.desktopRailCompact)}
    >
      {linkedinHref ? (
        <a
          href={linkedinHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${fullName} on LinkedIn (opens in a new tab)`}
          className={cn(styles.railItem, styles.railAction)}
        >
          <span className={cn(styles.railLabel, styles.railLabelRoute)}>
            LinkedIn
          </span>
          <LinkedInMark size={14} className={styles.railIcon} />
        </a>
      ) : null}
      <a
        href={`mailto:${email}`}
        aria-label={`Email ${fullName}`}
        className={cn(styles.railItem, styles.railAction)}
      >
        <span className={cn(styles.railLabel, styles.railLabelRoute)}>
          Email
        </span>
        <Mail
          size={14}
          className={styles.railIcon}
          aria-hidden="true"
          focusable="false"
        />
      </a>
      <a
        href={resumeHref}
        download
        aria-label={`Download ${fullName}'s résumé`}
        className={cn(styles.railItem, styles.railAction)}
      >
        <span className={cn(styles.railLabel, styles.railLabelRoute)}>
          Résumé
        </span>
        <FileText
          size={14}
          className={styles.railIcon}
          aria-hidden="true"
          focusable="false"
        />
      </a>
    </nav>
  );
}
