import Image from "next/image";
import type {
  PersonalData,
  ProfileIntroContent,
  SectionTone,
  ServiceEntry,
} from "@/types";
import SectionWrapper from "@/components/ui/SectionWrapper";
import StillLifePlate from "@/components/art/StillLifePlate";
import ServiceTiles from "./about/ServiceTiles";
import styles from "./AboutSection.module.css";

interface AboutSectionProps {
  personal: PersonalData;
  intro: ProfileIntroContent;
  services: ServiceEntry[];
  tone?: SectionTone;
}

// What I do: the coloured service tiles, then the black-cherry spec sheet with
// the monogram. The first statement line is the sheet's headline and the rest
// are its points.
export default function AboutSection({
  personal,
  intro,
  services,
  tone,
}: AboutSectionProps) {
  const [headline, ...points] = intro.proofLines;

  return (
    <SectionWrapper id="about" tone={tone} className={styles.aboutSection}>
      <div className={styles.sectionContent}>
        <h2 className={styles.sectionLabel}>{intro.headline}</h2>

        <ServiceTiles services={services} />

        <div className={`spec-sheet ${styles.composition}`}>
          <div className={styles.portraitColumn}>
            <div className={styles.imageFrame}>
              <Image
                src={personal.heroPhoto}
                alt={`${personal.fullName} editorial monogram`}
                width={640}
                height={640}
                className={styles.heroImage}
              />
            </div>
            <div className={styles.stillLife}>
              <StillLifePlate />
            </div>
            <span className={styles.hintCopy} data-secret-hint="true">
              {personal.hintCopy.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </span>
          </div>

          <div className={`spec-body ${styles.copyColumn}`}>
            <p className={styles.heading}>{headline}</p>
            <ul className={styles.proofList}>
              {points.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
