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
  const letters = Array.from(name);

  return (
    <h1
      className={styles.nameShell}
      aria-label={name}
      data-home-hero-heading="true"
      data-hero-wordmark="true"
    >
      <span className={styles.wordmark} aria-hidden="true">
        <span
          className={`${styles.lettersLayer} ${styles.biteLayer}`}
          data-hero-print-layer="bite"
          aria-hidden="true"
        >
          {letters.map((letter, index) => (
            <span
              className={`${styles.letter} ${styles.biteLetter}`}
              data-hero-letter="true"
              key={`bite-${letter}-${index}`}
            >
              {letter}
            </span>
          ))}
        </span>
        <span
          className={`${styles.lettersLayer} ${styles.liftLayer}`}
          data-hero-print-layer="lift"
          aria-hidden="true"
        >
          {letters.map((letter, index) => (
            <span
              className={`${styles.letter} ${styles.liftLetter}`}
              data-hero-letter="true"
              key={`lift-${letter}-${index}`}
            >
              {letter}
            </span>
          ))}
        </span>
        <span
          className={`${styles.lettersLayer} ${styles.inkLayer}`}
          data-hero-print-layer="ink"
          data-home-hero-wordmark="true"
          data-hero-ink="true"
          aria-hidden="true"
        >
          {letters.map((letter, index) => (
            <span
              className={styles.letter}
              data-hero-letter="true"
              key={`ink-${letter}-${index}`}
            >
              {letter}
            </span>
          ))}
        </span>
        <span className={styles.glint} aria-hidden="true" data-ink-glint="true">
          {name}
        </span>
      </span>
      {portalTrigger ? <PortalNameTrigger trigger={portalTrigger} /> : null}
    </h1>
  );
}
