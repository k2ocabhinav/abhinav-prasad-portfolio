"use client";

import { useEffect, useState } from "react";
import AnimatedName from "./AnimatedName";
import MagneticButton from "@/components/ui/MagneticButton";
import type { LandingHeroContent } from "@/types";
import styles from "./HeroTextColumn.module.css";

// =============================================================================
// HeroTextColumn — the hero's text stack.
//
// The identity, summary, and two facts are fully readable in server-rendered
// HTML. After hydration, a small print-in settles the labels and draws their
// rule without hiding the copy that was already on screen.
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
  const [printIn, setPrintIn] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const frame = window.requestAnimationFrame(() => setPrintIn(true));
    return () => window.cancelAnimationFrame(frame);
  }, [reduceMotion]);

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
        <p className={styles.identity}>{hero.identity}</p>
        <p className={styles.value}>{hero.summary}</p>

        <nav
          className={styles.factSheet}
          aria-label="Work and personal builds"
          data-hero-facts="true"
          data-printed={printIn ? "true" : "false"}
          data-reduce-motion={reduceMotion ? "true" : "false"}
        >
          <span className={styles.factRule} aria-hidden="true" />
          <div className={styles.factList}>
            {hero.facts.map((fact) => (
              <a key={fact.label} href={fact.href} className={styles.factLink}>
                <span className={styles.factLabel}>{fact.label}</span>
                <span className={styles.factValue}>{fact.value}</span>
              </a>
            ))}
          </div>
        </nav>

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
