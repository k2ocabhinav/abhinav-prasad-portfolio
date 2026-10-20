import type { PersonalData } from "@/types";
import PrinterSlug from "@/components/art/PrinterSlug";
import { cn } from "@/lib/utils";
import styles from "./Footer.module.css";

// =============================================================================
// Footer — Copyright, colophon and branding
// =============================================================================

interface FooterProps {
  personal: Pick<PersonalData, "name">;
  /** Home route only: park the colophon under the final field as a curtain. */
  curtain?: boolean;
}

export default function Footer({ personal, curtain = false }: FooterProps) {
  return (
    <footer className={cn(styles.footer, curtain && styles.curtain)}>
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
