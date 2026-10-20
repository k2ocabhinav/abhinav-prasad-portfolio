import HeroTextColumn from "./HeroTextColumn";
import ExplodedStack from "./ExplodedStack";
import AnimatedName from "./AnimatedName";
import PressRunController from "./PressRunController";
import type { LandingHeroContent } from "@/types";
import styles from "./LandingFrame1Hero.module.css";

interface LandingFrame1HeroProps {
  hero: LandingHeroContent;
  name: string;
  fullName: string;
  linkedinHref: string | undefined;
}

export default function LandingFrame1Hero({
  hero,
  name,
  fullName,
  linkedinHref,
}: LandingFrame1HeroProps) {
  return (
    <div className={styles.frame} data-home-hero-frame="true">
      <div className={styles.content}>
        <header className={styles.masthead} aria-label="Introduction">
          <span className={styles.mastheadName}>{fullName}</span>
          <span className={styles.mastheadRole}>{hero.identity}</span>
        </header>
        <AnimatedName
          name={name}
          portalTrigger={{
            href: "/beyond-terminal",
            source: "easter-egg",
            variant: "portal-bloom",
            skin: "beyond-pastel-mist",
          }}
        />
        <div className={styles.heroGrid}>
          <HeroTextColumn
            hero={hero}
            fullName={fullName}
            linkedinHref={linkedinHref}
          />
          <ExplodedStack />
        </div>
      </div>
      <PressRunController />
    </div>
  );
}
