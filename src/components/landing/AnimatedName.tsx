import PortalNameTrigger from "./PortalNameTrigger";
import type { PortalTransitionIntent } from "@/types";
import styles from "./AnimatedName.module.css";

interface AnimatedNameProps {
  name: string;
  portalTrigger?: {
    href: string;
    source: PortalTransitionIntent["source"];
    variant?: PortalTransitionIntent["variant"];
    skin?: PortalTransitionIntent["skin"];
  };
}

export default function AnimatedName({ name, portalTrigger }: AnimatedNameProps) {
  return (
    <h1
      className={styles.nameShell}
      aria-label={name}
      data-home-hero-heading="true"
    >
      <span className={styles.wordmark} data-home-hero-wordmark="true" aria-hidden="true">
        {Array.from(name, (letter, index) => (
          <span className={styles.letterMask} key={`${letter}-${index}`}>
            <span
              className={styles.letter}
              style={{ "--letter-index": index } as React.CSSProperties}
            >
              {letter}
            </span>
          </span>
        ))}
      </span>
      <span className={styles.plate} data-ink-plate-drift="true" aria-hidden="true">
        {Array.from(name, (letter, index) => (
          <span className={styles.letterMask} key={`plate-${letter}-${index}`}>
            <span
              className={styles.plateLetter}
              style={{ "--letter-index": index } as React.CSSProperties}
            >
              {letter}
            </span>
          </span>
        ))}
      </span>
      {portalTrigger ? <PortalNameTrigger trigger={portalTrigger} /> : null}
    </h1>
  );
}
