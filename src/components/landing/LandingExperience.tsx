import LandingFrame1Hero from "./LandingFrame1Hero";
import LandingFrame3Services from "./LandingFrame3Services";
import styles from "./LandingExperience.module.css";
import type { LandingHeroContent, ServiceEntry } from "@/types";

interface LandingExperienceProps {
  hero: LandingHeroContent;
  services: ServiceEntry[];
  fullName: string;
  linkedinHref: string | undefined;
}

export default function LandingExperience({
  hero,
  services,
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
      <div className={`deferred-section ${styles.deferredFrames}`}>
        {services.length > 0 ? (
          <LandingFrame3Services services={services} />
        ) : null}
      </div>
    </div>
  );
}
