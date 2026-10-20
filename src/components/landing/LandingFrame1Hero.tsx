import HeroTextColumn from "./HeroTextColumn";
import ProofCorner from "./ProofCorner";
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
        <HeroTextColumn
          hero={hero}
          name={name}
          fullName={fullName}
          linkedinHref={linkedinHref}
        />
      </div>
      <PressRunController proofCorner={<ProofCorner />} />
    </div>
  );
}
