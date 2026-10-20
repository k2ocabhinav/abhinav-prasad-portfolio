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
    >
      <span className={styles.plateDrift} data-ink-plate-drift="true" aria-hidden="true">
        <span className={styles.inkPlate}>{name}</span>
      </span>
      <span className={styles.wordmark} data-home-hero-wordmark="true">
        {name}
      </span>
      {portalTrigger ? <PortalNameTrigger trigger={portalTrigger} /> : null}
    </h1>
  );
}
