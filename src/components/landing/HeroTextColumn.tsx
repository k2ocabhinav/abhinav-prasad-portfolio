"use client";

import AnimatedName from "./AnimatedName";
import MagneticButton from "@/components/ui/MagneticButton";
import type { LandingHeroContent } from "@/types";
import styles from "./HeroTextColumn.module.css";

// =============================================================================
// HeroTextColumn — the hero's text stack.
//
// One static role line, one value sentence and the current role. Nothing here
// fades or cycles: the copy is painted on the first frame, so it is readable
// the moment the page appears. The wordmark's letter entrance and the dispatch
// board are the hero's motion.
// =============================================================================

interface HeroTextColumnProps {
  hero: LandingHeroContent;
  name: string;
  reduceMotion?: boolean;
}

export default function HeroTextColumn({
  hero,
  name,
  reduceMotion = false,
}: HeroTextColumnProps) {
  const roleLine = hero.roleCycleWords?.[0] ?? "Forward Deployed Engineer";

  return (
    <div className={styles.textColumn} data-home-hero-text="true">
      <AnimatedName
        name={name}
        reduceMotion={reduceMotion}
        portalTrigger={{
          href: "/beyond-terminal",
          source: "easter-egg",
          variant: "portal-bloom",
          skin: "beyond-pastel-mist",
        }}
      />

      <div className={styles.stack}>
        <p className={styles.roleLine}>{roleLine}</p>
        <p className={styles.value}>{hero.supportingCopy}</p>
        <p className={styles.currentRole}>{hero.displayTitleAccent}</p>

        <div className={styles.ctaGroup}>
          {hero.ctas.map((cta) =>
            cta.variant === "primary" ? (
              <MagneticButton key={cta.label} href={cta.href} variant="glow">
                {cta.label}
              </MagneticButton>
            ) : (
              <a key={cta.label} href={cta.href} className={styles.secondaryCta}>
                {cta.label}
              </a>
            )
          )}
        </div>
      </div>
    </div>
  );
}
