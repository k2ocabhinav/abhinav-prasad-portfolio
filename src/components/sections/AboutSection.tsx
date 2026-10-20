import Image from "next/image";
import type {
  PersonalData,
  ProfileIntroContent,
  SectionTone,
  ServiceEntry,
} from "@/types";
import SectionWrapper from "@/components/ui/SectionWrapper";
import StillLifePlate from "@/components/art/StillLifePlate";
import ClipReveal from "@/components/motion/ClipReveal";
import RevealText from "@/components/motion/RevealText";
import ScrubText from "@/components/motion/ScrubText";
import styles from "./AboutSection.module.css";

interface AboutSectionProps {
  personal: PersonalData;
  intro: ProfileIntroContent;
  services: ServiceEntry[];
  tone?: SectionTone;
}

type ServiceGlyphKind = "backend" | "product" | "agents";

interface ServiceGlyphProps {
  kind: ServiceGlyphKind;
}

function ServiceGlyph({ kind }: ServiceGlyphProps) {
  return (
    <svg
      className={styles.serviceGlyph}
      viewBox="0 0 64 48"
      aria-hidden="true"
      focusable="false"
      data-service-glyph="true"
    >
      {kind === "backend" ? (
        <>
          <rect className={styles.glyphShape} pathLength={1} x="6" y="6" width="52" height="36" />
          <path className={styles.glyphShape} pathLength={1} d="M6 16h52M18 16v26M40 16v26" />
          <path className={styles.glyphAccent} pathLength={1} d="M11 11h3m7 0h3m7 0h3m7 0h3m7 0h3" />
          <path className={styles.glyphShape} pathLength={1} d="M24 24h10m-10 7h10m-28-7h5m-5 7h5m23-7h6m-6 7h6" />
        </>
      ) : null}
      {kind === "product" ? (
        <>
          <rect className={styles.glyphShape} pathLength={1} x="7" y="4" width="50" height="34" />
          <path className={styles.glyphAccent} pathLength={1} d="M7 12h50M12 8h3m4 0h3" />
          <path className={styles.glyphShape} pathLength={1} d="M17 20h30M17 25h24M17 30h17M24 38v5m16-5v5M20 43h24" />
        </>
      ) : null}
      {kind === "agents" ? (
        <>
          <path className={styles.glyphShape} pathLength={1} d="M8 11h34m-34 13h34m-34 13h34" />
          <path className={styles.glyphAccent} pathLength={1} d="M43 24h9m-5-5 5 5-5 5" />
          <path className={styles.glyphShape} pathLength={1} d="m46 37 4 4 8-10" />
          <circle className={styles.glyphNode} cx="8" cy="11" r="2.5" />
          <circle className={styles.glyphNode} cx="8" cy="24" r="2.5" />
          <circle className={styles.glyphNode} cx="8" cy="37" r="2.5" />
        </>
      ) : null}
    </svg>
  );
}

const serviceGlyphs: readonly ServiceGlyphKind[] = ["backend", "product", "agents"];

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
            <div className={styles.identityArtwork}>
              <Image
                src={personal.heroPhoto}
                alt={`${personal.fullName} monogram`}
                width={640}
                height={640}
                sizes="(max-width: 767px) 5.5rem, 9rem"
                className={styles.monogram}
              />
              <div className={styles.stillLife}>
                <StillLifePlate />
              </div>
            </div>
            <p className={styles.hintCopy} data-secret-hint="true">
              {personal.hintCopy.map((line) => <span key={line}>{line}</span>)}
            </p>
          </aside>
        </div>

        <ol className={styles.serviceList} aria-label="Engineering services">
          {services.map((service, index) => (
            <li className={styles.serviceItem} key={service.id}>
              <article className={styles.serviceRow}>
                <span
                  className={styles.serviceNumber}
                  aria-hidden="true"
                  data-service-number="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className={styles.serviceCopy}>
                  <h3 className={styles.serviceHeading} aria-label={service.title}>
                    <RevealText
                      text={service.title}
                      className={styles.serviceTitle}
                    />
                  </h3>
                  <p className={styles.serviceDescription}>{service.description}</p>
                  <ul className={styles.serviceTags} aria-label={`${service.title} areas`}>
                    {service.tags?.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </div>
                <ClipReveal className={styles.glyphReveal}>
                  <ServiceGlyph kind={serviceGlyphs[index] ?? "backend"} />
                </ClipReveal>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </SectionWrapper>
  );
}
