import Image from "next/image";
import type { PersonalData, ProfileIntroContent, SectionTone } from "@/types";
import SectionWrapper from "@/components/ui/SectionWrapper";
import StillLifePlate from "@/components/art/StillLifePlate";
import styles from "./AboutSection.module.css";

interface AboutSectionProps {
  personal: PersonalData;
  intro: ProfileIntroContent;
  tone?: SectionTone;
}

export default function AboutSection({
  personal,
  intro,
  tone,
}: AboutSectionProps) {
  const proofLines = intro.proofLines;

  return (
    <SectionWrapper id="about" tone={tone} className={styles.aboutSection}>
      <div className={`spec-sheet ${styles.composition}`}>
        <div className={styles.portraitColumn}>
          <div className={styles.imageFrame}>
            <Image
              src={personal.heroPhoto}
              alt={`${personal.fullName} editorial monogram`}
              width={640}
              height={640}
              className={styles.heroImage}
              priority={false}
            />
          </div>
          <div className={styles.stillLife}>
            <StillLifePlate />
          </div>
          <span className={styles.hintCopy} data-secret-hint="true">
            <span>Personal layer</span>
            <span>v opens it</span>
          </span>
        </div>

        <div className={`spec-body ${styles.copyColumn}`}>
          <h2 className={styles.heading}>{intro.headline}</h2>
          <ul className={styles.proofList}>
            {proofLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className={styles.philosophyText}>{personal.philosophy}</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
