import type { ReactNode } from "react";
import MinimalChrome from "./MinimalChrome";
import styles from "./BeyondShell.module.css";

interface BeyondShellProps {
  children: ReactNode;
}

export default function BeyondShell({ children }: BeyondShellProps) {
  return (
    <div className={styles.shell}>
      <MinimalChrome />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
