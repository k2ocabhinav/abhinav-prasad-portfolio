import type { PersonalData } from "@/types";
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
      <p className={styles.colophon}>
        Set in Fraunces, Newsreader &amp; Fragment Mono · Badlapur, IN
      </p>
    </footer>
  );
}
