import AnimatedName from "./AnimatedName";
import MagneticButton from "@/components/ui/MagneticButton";
import type { LandingHeroContent } from "@/types";
import styles from "./HeroTextColumn.module.css";

// =============================================================================
// HeroTextColumn — the hero's text stack.
//
// The identity, summary, and two facts are fully readable in server-rendered
// HTML. The wordmark owns the landing's single entrance motion.
// =============================================================================

interface HeroTextColumnProps {
  hero: LandingHeroContent;
  name: string;
  fullName: string;
  linkedinHref: string | undefined;
}

export default function HeroTextColumn({
  hero,
  name,
  fullName,
  linkedinHref,
}: HeroTextColumnProps) {
  return (
    <div className={styles.textColumn} data-home-hero-text="true">
      <AnimatedName
        name={name}
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
        >
          <span className={styles.factRule} aria-hidden="true" />
          <div className={styles.factList}>
            {hero.facts.map((fact) => (
              <a
                key={fact.label}
                href={fact.href}
                className={styles.factLink}
                data-cursor-theme="dark-hover"
              >
                <span className={styles.factLabel}>{fact.label}</span>
                <span className={styles.factValue}>{fact.value}</span>
              </a>
            ))}
          </div>
        </nav>

        <div className={styles.ctaGroup} data-hero-ctas="true">
          {hero.ctas
            .filter((cta) => cta.variant === "primary")
            .map((cta) => (
              <MagneticButton
                key={cta.label}
                href={cta.href}
                variant="glow"
                className={styles.primaryCta}
              >
                {cta.label}
              </MagneticButton>
            ))}
          <div className={styles.secondaryCtas}>
            {hero.ctas
              .filter((cta) => cta.variant === "secondary")
              .map((cta) => (
                <a key={cta.label} href={cta.href} className={styles.secondaryCta}>
                  {cta.label}
                </a>
              ))}
            {linkedinHref ? (
              <a
                href={linkedinHref}
                className={styles.secondaryCta}
                aria-label={`${fullName} on LinkedIn (opens in a new tab)`}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
