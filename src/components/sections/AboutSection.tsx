import Image from "next/image";
import type {
  PersonalData,
  ProfileIntroContent,
  SectionTone,
  ServiceEntry,
} from "@/types";
import SectionWrapper from "@/components/ui/SectionWrapper";
import StillLifePlate from "@/components/art/StillLifePlate";
import styles from "./AboutSection.module.css";

interface AboutSectionProps {
  personal: PersonalData;
  intro: ProfileIntroContent;
  services: ServiceEntry[];
  tone?: SectionTone;
}

export default function AboutSection({
  personal,
  intro,
  services,
  tone,
}: AboutSectionProps) {
  return (
    <SectionWrapper id="about" tone={tone} className={styles.aboutSection}>
      <div className={styles.sectionContent}>
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
              <span>Personal layer</span>
              <span>v opens it</span>
            </span>
          </div>

          <div className={styles.copyColumn}>
            <h2 className={styles.heading}>{intro.headline}</h2>
            <div className={styles.introLines}>
              {intro.proofLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.serviceList} aria-label="Engineering work">
          {services.map((service) => (
            <article className={styles.serviceRow} key={service.id}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul aria-label={`${service.title} areas`}>
                {service.tags?.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
