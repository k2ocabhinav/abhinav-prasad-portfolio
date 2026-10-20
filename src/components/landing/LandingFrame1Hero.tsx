import HeroTextColumn from "./HeroTextColumn";
import type { LandingHeroContent } from "@/types";
import styles from "./LandingFrame1Hero.module.css";

interface LandingFrame1HeroProps {
  hero: LandingHeroContent;
  name: string;
}

export default function LandingFrame1Hero({
  hero,
  name,
}: LandingFrame1HeroProps) {
  return (
    <div className={styles.frame} data-home-hero-frame="true">
      <div className={styles.content}>
        <HeroTextColumn hero={hero} name={name} />
      </div>
    </div>
  );
}
