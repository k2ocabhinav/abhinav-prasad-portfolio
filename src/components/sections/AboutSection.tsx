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

type PortraitStyle = "print" | "duotone";
type PortraitSources = {
  avif: readonly [string, string, string];
  webp: readonly [string, string, string];
};

const PORTRAIT_STYLE: PortraitStyle = "print";
const PORTRAIT_ASSETS = {
  print: {
    avif: [
      "/profile/portrait-print.10fff375-1x.avif",
      "/profile/portrait-print.10fff375-2x.avif",
      "/profile/portrait-print.10fff375-3x.avif",
    ],
    webp: [
      "/profile/portrait-print.10fff375-1x.webp",
      "/profile/portrait-print.10fff375-2x.webp",
      "/profile/portrait-print.10fff375-3x.webp",
    ],
  },
  duotone: {
    avif: [
      "/profile/portrait-duotone.49f2182e-1x.avif",
      "/profile/portrait-duotone.49f2182e-2x.avif",
      "/profile/portrait-duotone.49f2182e-3x.avif",
    ],
    webp: [
      "/profile/portrait-duotone.49f2182e-1x.webp",
      "/profile/portrait-duotone.49f2182e-2x.webp",
      "/profile/portrait-duotone.49f2182e-3x.webp",
    ],
  },
} satisfies Record<PortraitStyle, PortraitSources>;

function portraitSrcSet(format: "avif" | "webp"): string {
  return PORTRAIT_ASSETS[PORTRAIT_STYLE][format]
    .map((source, index) => `${source} ${index + 1}x`)
    .join(", ");
}

interface AboutSectionProps {
  personal: PersonalData;
  intro: ProfileIntroContent;
  services: ServiceEntry[];
  tone?: SectionTone;
}

// What I do: the coloured service tiles, then the black-cherry spec sheet with
// the portrait plate. The first statement line is the sheet's headline and the
// rest are its points.
export default function AboutSection({
  personal,
  intro,
  services,
  tone,
}: AboutSectionProps) {
  const [headline, ...points] = intro.proofLines;

  return (
    <>
      <SectionWrapper id="about" tone={tone} className={styles.serviceBand}>
        <div className={styles.tileContent}>
          <h2 className={styles.sectionLabel}>{intro.headline}</h2>
          <ServiceTiles services={services} />
        </div>
      </SectionWrapper>

      <SectionWrapper id="about-spec" tone={tone} className={styles.specBand}>
        <div className={styles.specContent}>
          <div className={`spec-sheet ${styles.composition}`}>
            <div className={styles.portraitColumn}>
              <div className={styles.plateStage} data-portrait-plate>
                <Image
                  src={personal.heroPhoto}
                  alt=""
                  width={640}
                  height={640}
                  sizes="288px"
                  className={styles.plateBackground}
                  aria-hidden="true"
                />
                <picture className={styles.printMount} data-portrait-print>
                  <source type="image/avif" srcSet={portraitSrcSet("avif")} />
                  <source type="image/webp" srcSet={portraitSrcSet("webp")} />
                  <img
                    className={styles.printImage}
                    data-portrait-image
                    src={PORTRAIT_ASSETS[PORTRAIT_STYLE].webp[0]}
                    srcSet={portraitSrcSet("webp")}
                    alt="Abhinav Prasad smiling, holding a cup of tea."
                    width={360}
                    height={450}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <div className={styles.plateIdentity} data-portrait-identity>
                  <span>ABHINAV</span>
                  <span>FULL-STACK ENGINEER</span>
                </div>
                <div className={styles.stillLife} data-portrait-still-life>
                  <StillLifePlate />
                </div>
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
    </>
  );
}
