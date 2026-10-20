import LandingFrame1Hero from "./LandingFrame1Hero";
import styles from "./LandingExperience.module.css";
import type { LandingHeroContent } from "@/types";

interface LandingExperienceProps {
  hero: LandingHeroContent;
  fullName: string;
  linkedinHref: string | undefined;
}

export default function LandingExperience({
  hero,
  fullName,
  linkedinHref,
}: LandingExperienceProps) {
  return (
    <div className={styles.landing}>
      <section id="hero" className={styles.heroFrame} aria-label="Hero">
        <LandingFrame1Hero
          hero={hero}
          name={hero.displayTitle}
          fullName={fullName}
          linkedinHref={linkedinHref}
        />
      </section>
    </div>
  );
}
