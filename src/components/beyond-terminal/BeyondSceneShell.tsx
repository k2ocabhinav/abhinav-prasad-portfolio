import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import styles from "./BeyondSceneShell.module.css";

interface BeyondSceneShellProps {
  id: string;
  eyebrow: string;
  title: string;
  deck: string;
  children: ReactNode;
  variant?: "hero" | "stack" | "journal";
}

export default function BeyondSceneShell({
  id,
  eyebrow,
  title,
  deck,
  children,
  variant = "stack",
}: BeyondSceneShellProps) {
  return (
    <section
      id={id}
      data-act={id}
      data-scene={variant}
      className={cn(styles.section, variant === "hero" && styles.sectionHero)}
    >
      <header className={styles.header} data-beyond-reveal>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.deck}>{deck}</p>
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
