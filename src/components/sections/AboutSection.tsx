import Image from "next/image";
import type {
  PersonalData,
  ProfileIntroContent,
  SectionTone,
  ServiceEntry,
} from "@/types";
import SectionWrapper from "@/components/ui/SectionWrapper";
import RevealText from "@/components/motion/RevealText";
import ScrubText from "@/components/motion/ScrubText";
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
        <header className={styles.sectionHeader}>
          <h2 className={styles.heading}>{intro.headline}</h2>
        </header>

        <div className={styles.statementLayout}>
          <ScrubText
            paragraphs={intro.proofLines}
            className={styles.statement}
            paragraphClassName={styles.statementParagraph}
          />

          <aside className={styles.identityAside} aria-label="Personal layer">
            <Image
              src={personal.heroPhoto}
              alt={`${personal.fullName} monogram`}
              width={640}
              height={640}
              sizes="(min-width: 1200px) 18rem, (min-width: 1024px) 15rem, (min-width: 768px) 7rem, 4.5rem"
              className={styles.monogram}
            />
            <p className={styles.hintCopy} data-secret-hint="true">
              {personal.hintCopy.map((line) => <span key={line}>{line}</span>)}
            </p>
          </aside>
        </div>

        <table className={styles.serviceTable} aria-label="Engineering areas and evidence">
          <colgroup>
            <col className={styles.areaColumn} />
            <col className={styles.descriptionColumn} />
            <col className={styles.proofColumn} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Area</th>
              <th scope="col">Where it shows</th>
              <th scope="col">Proof tags</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr className={styles.serviceRow} key={service.id}>
                <th scope="row">
                  <h3 className={styles.serviceHeading}>
                    <RevealText
                      text={service.title}
                      className={styles.serviceTitle}
                    />
                  </h3>
                </th>
                <td data-label="Where it shows">
                  <p className={styles.serviceDescription}>{service.description}</p>
                </td>
                <td data-label="Proof tags">
                  <ul
                    className={styles.serviceTags}
                    aria-label={`${service.title} proof tags`}
                  >
                    {service.tags?.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
