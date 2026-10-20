"use client";

import { usePortalNavigation } from "@/hooks/usePortalNavigation";
import type { PortalTransitionIntent } from "@/types";
import styles from "./AnimatedName.module.css";

interface PortalNameTriggerProps {
  trigger: {
    href: string;
    source: PortalTransitionIntent["source"];
    variant?: PortalTransitionIntent["variant"];
    skin?: PortalTransitionIntent["skin"];
  };
}

export default function PortalNameTrigger({ trigger }: PortalNameTriggerProps) {
  const { getTriggerProps, isTransitioning } = usePortalNavigation();
  const triggerProps = getTriggerProps(trigger);

  return (
    <button
      type="button"
      className={styles.portalButton}
      aria-label="Open Beyond The Terminal"
      data-animated-name="hero-trigger"
      data-animated-letter-index="6"
      data-portal-letter="true"
      onPointerDown={triggerProps.onPointerDown}
      onKeyDown={triggerProps.onKeyDown}
      onClick={triggerProps.onClick}
      disabled={isTransitioning}
    />
  );
}
