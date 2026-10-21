import LandingFrame1Hero from "./LandingFrame1Hero";
import SheetLight from "./SheetLight";
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
      <SheetLight>
        <LandingFrame1Hero
          hero={hero}
          name={hero.displayTitle}
          fullName={fullName}
          linkedinHref={linkedinHref}
        />
      </SheetLight>
    </div>
  );
}
