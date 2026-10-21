import type { PersonalData } from "@/types";
import PrinterSlug from "@/components/art/PrinterSlug";
import styles from "./Footer.module.css";

// =============================================================================
// Footer — Copyright, colophon and branding
// =============================================================================

interface FooterProps {
  personal: Pick<PersonalData, "name">;
  topTargetId: string;
}

export default function Footer({ personal, topTargetId }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>
        © {new Date().getFullYear()} {personal.name}. All rights reserved.
      </p>
      <a href={`#${topTargetId}`} className={styles.backToTop}>
        Back to top
      </a>
      <div className={styles.colophonRow}>
        <PrinterSlug />
        <p className={styles.colophon}>
          Typeset in Fraunces, Newsreader, Hanken Grotesk, and Fragment Mono.
        </p>
      </div>
    </footer>
  );
}
