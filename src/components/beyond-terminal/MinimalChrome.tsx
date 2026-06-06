"use client";

import Link from "next/link";
import styles from "./MinimalChrome.module.css";

export default function MinimalChrome() {
  return (
    <header className={styles.chrome}>
      <div className={styles.inner}>
        <Link href="/beyond-terminal" className={styles.brand} aria-label="Beyond The Terminal home">
          <span className={styles.markWrap} aria-hidden="true">
            <span className={styles.markDot} />
          </span>
          <span className={styles.brandCopy}>
            <span className={styles.brandEyebrow}>Beyond The Terminal</span>
            <span className={styles.brandTitle}>Photo wall</span>
          </span>
        </Link>

        <span className={styles.routeLabel}>Hidden album</span>

        <Link href="/" className={styles.actionPrimary}>
          Home
        </Link>
      </div>
    </header>
  );
}
