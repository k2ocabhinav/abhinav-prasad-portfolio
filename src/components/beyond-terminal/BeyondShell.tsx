import type { ReactNode } from "react";
import MinimalChrome from "./MinimalChrome";
import styles from "./BeyondShell.module.css";

interface BeyondShellProps {
  children: ReactNode;
}

export default function BeyondShell({ children }: BeyondShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />
      <MinimalChrome />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
