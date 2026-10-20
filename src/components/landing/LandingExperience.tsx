import LandingFrame1Hero from "./LandingFrame1Hero";
import LandingFrame3Services from "./LandingFrame3Services";
import styles from "./LandingExperience.module.css";
import type { LandingHeroContent, ServiceEntry } from "@/types";

interface LandingExperienceProps {
  hero: LandingHeroContent;
  services: ServiceEntry[];
}

export default function LandingExperience({
  hero,
  services,
}: LandingExperienceProps) {
  return (
    <div className={styles.landing}>
      <section id="hero" className={styles.heroFrame} aria-label="Hero">
        <LandingFrame1Hero
          hero={hero}
          name={hero.displayTitle}
        />
      </section>
      <div className={`deferred-section ${styles.deferredFrames}`}>
        {services.length > 0 ? (
          <LandingFrame3Services services={services} />
        ) : null}
      </div>
    </div>
  );
}
