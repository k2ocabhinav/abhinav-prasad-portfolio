import { personal } from "@/data/personal";
import styles from "./Footer.module.css";

// =============================================================================
// Footer — Copyright and branding
// =============================================================================

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>
        © {new Date().getFullYear()} {personal.name}. All rights reserved.
      </p>
    </footer>
  );
}
