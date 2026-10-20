import type { PersonalData } from "@/types";
import PrinterSlug from "@/components/art/PrinterSlug";
import styles from "./Footer.module.css";

// =============================================================================
// Footer — Copyright and branding
// =============================================================================

interface FooterProps {
  personal: Pick<PersonalData, "name">;
}

export default function Footer({ personal }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>
        © {new Date().getFullYear()} {personal.name}. All rights reserved.
      </p>
      <div className={styles.colophonRow}>
        <PrinterSlug />
        <p className={styles.colophon}>
          Typeset in Fraunces, Newsreader, Hanken Grotesk, and Fragment Mono.
        </p>
      </div>
    </footer>
  );
}
