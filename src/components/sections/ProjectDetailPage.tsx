"use client";

import Image from "next/image";
import Link from "next/link";
import type { PersonalData, ProjectDetail, ProjectStoryVisual, ProjectTenantOption } from "@/types";
import Footer from "@/components/layout/Footer";
import DispatchReel from "@/components/sections/project-detail/DispatchReel";
import TenantSwitcher from "@/components/sections/project-detail/TenantSwitcher";
import VeloRoutePlate from "@/components/sections/project-detail/VeloRoutePlate";
import styles from "./ProjectDetailPage.module.css";

interface ProjectDetailPageProps {
  detail: ProjectDetail;
  personal: PersonalData;
}

interface SectionIntroContent {
  eyebrow: string;
  title: string;
  summary?: string;
}

function SectionIntro({ intro, headingId }: { intro: SectionIntroContent; headingId: string }) {
  return (
    <div className={styles.sectionIntro}>
      <p className={styles.eyebrow}>{intro.eyebrow}</p>
      <h2 id={headingId} className={styles.sectionTitle}>{intro.title}</h2>
      {intro.summary ? <p className={styles.sectionSummary}>{intro.summary}</p> : null}
    </div>
  );
}

interface VisualFigureProps {
  visual: ProjectStoryVisual;
  className?: string;
  frameClassName: string;
  imageClassName?: string;
  sizes: string;
}

function VisualFigure({ visual, className, frameClassName, imageClassName, sizes }: VisualFigureProps) {
  return (
    <figure className={className}>
      <div className={frameClassName}>
        <Image
          src={visual.src}
          alt={visual.alt}
          fill
          sizes={sizes}
          className={imageClassName}
        />
      </div>
      <figcaption className={styles.figureCaption}>{visual.caption}</figcaption>
    </figure>
  );
}

const LEGACY_TILES = [
  "legacyTileLead",
  "legacyTileWideLeft",
  "legacyTileWideRight",
  "legacyTileThirdLeft",
  "legacyTileThirdCenter",
  "legacyTileThirdRight",
] as const;

function LegacyGallery({ detail }: { detail: ProjectDetail }) {
  return (
    <section className={styles.section} aria-labelledby="gallery-title">
      <p className={styles.eyebrow}>Project visuals</p>
      <h2 id="gallery-title" className={styles.sectionTitle}>Screens from the build</h2>
      <div className={styles.legacyGallery}>
        {detail.gallery.map((visual, index) => (
          <figure
            className={`${styles.legacyFigure} ${styles[LEGACY_TILES[index] ?? ""]}`}
            key={visual.src}
          >
            <div className={styles.legacyFrame}>
              <Image src={visual.src} alt={visual.alt} fill sizes="(max-width: 767px) 100vw, 50vw" />
            </div>
            <figcaption className={styles.figureCaption}>{visual.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default function ProjectDetailPage({ detail, personal }: ProjectDetailPageProps) {
  const storyboard = detail.storyboard;
  const visuals = storyboard?.visuals ?? [];
  const getVisual = (id: string) => visuals.find((visual) => visual.id === id);
  const getChapter = (id: string) => storyboard?.chapters.find((chapter) => chapter.id === id);
  const liveryChapter = getChapter("livery");
  const tenantChapter = getChapter("tenant-views");
  const scheduleChapter = getChapter("weekly-work");
  const dayVisual = getVisual("livery-day");
  const nightVisual = getVisual("livery-night");
  const mobileLiveryVisual = getVisual("livery-mobile");
  const brandingVisual = getVisual("saffron-branding");
  const tripSheetVisual = getVisual("trip-sheet");
  const switcherOptions: ProjectTenantOption[] = storyboard?.tenantSwitcher.options ?? [];

  return (
    <div className={styles.pageShell}>
      <header className={styles.chrome}>
        <div className={`content-container ${styles.chromeInner}`}>
          <Link href="/#work" prefetch={false} className={styles.backLink}>
            ← Back to Works
          </Link>
          <span className={styles.chromeLabel}>Project file</span>
        </div>
      </header>

      <main className={`content-container ${styles.main}`}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{detail.eyebrow}</p>
            {storyboard ? <p className={styles.statusStamp}>Pre-launch working prototype</p> : null}
            <h1 className={styles.title}>{detail.title}</h1>
            <p className={styles.subtitle}>{detail.subtitle}</p>
            <p className={styles.scopeSummary}>{detail.scopeSummary}</p>
            {storyboard ? <VeloRoutePlate /> : null}
          </div>

          <figure className={styles.heroFigure}>
            <div className={styles.heroMedia}>
              <Image
                src={detail.heroImage.src}
                alt={detail.heroImage.alt}
                fill
                preload
                fetchPriority="high"
                className={styles.heroImage}
                sizes="(max-width: 767px) calc(100vw - 3.25rem), (max-width: 1023px) 43vw, (max-width: 1100px) 54vw, 650px"
              />
            </div>
            <figcaption className={styles.figureCaption}>{detail.heroImage.caption}</figcaption>
          </figure>
        </section>

        {storyboard ? (
          <div className={styles.factRail} aria-label="Project facts">
            <p><span>Stage</span>Pre-launch working prototype</p>
            <p><span>Product</span>Dispatch for pre-booked transfers</p>
            <p><span>Quality</span>334 backend tests, 16 Oct 2026</p>
          </div>
        ) : null}

        {storyboard ? (
          <>
            <section className={styles.section} aria-labelledby="trip-story-title">
              <div className={styles.sectionIntro}>
                <p className={styles.eyebrow}>01 / One trip</p>
                <h2 id="trip-story-title" className={styles.sectionTitle}>Three workspaces, one dispatch flow.</h2>
                <p className={styles.sectionSummary}>
                  A pre-booked request moves from rider to dispatch to driver. Fleet movement shown here is simulated demo traffic.
                </p>
              </div>
              <DispatchReel steps={storyboard.tripSteps} visuals={visuals} />
            </section>

            {tenantChapter ? (
              <section className={`${styles.section} ${styles.tenantSection}`} aria-labelledby="tenant-story-title">
                <SectionIntro intro={tenantChapter} headingId="tenant-story-title" />
                <TenantSwitcher
                  label={storyboard.tenantSwitcher.label}
                  defaultId={storyboard.tenantSwitcher.defaultId}
                  options={switcherOptions}
                  visuals={visuals}
                />
              </section>
            ) : null}

            {liveryChapter && dayVisual && nightVisual ? (
              <section className={styles.section} aria-labelledby="livery-story-title">
                <SectionIntro intro={liveryChapter} headingId="livery-story-title" />
                <div className={styles.liveryPair}>
                  <VisualFigure
                    visual={dayVisual}
                    className={styles.liveryFigure}
                    frameClassName={styles.liveryFrame}
                    imageClassName={styles.liveryImage}
                    sizes="(max-width: 767px) 100vw, 600px"
                  />
                  <VisualFigure
                    visual={nightVisual}
                    className={styles.liveryFigure}
                    frameClassName={styles.liveryFrame}
                    imageClassName={styles.liveryImage}
                    sizes="(max-width: 767px) 100vw, 600px"
                  />
                </div>
                {mobileLiveryVisual ? (
                  <div className={styles.mobileProof}>
                    <div>
                      <h3 className={styles.featureTitle}>The route view adapts to mobile.</h3>
                      <p className={styles.featureSummary}>
                        The day theme keeps the transfer map and booking actions in a single, vertical flow.
                      </p>
                    </div>
                    <VisualFigure
                      visual={mobileLiveryVisual}
                      className={styles.mobileLiveryFigure}
                      frameClassName={styles.mobileLiveryFrame}
                      imageClassName={styles.liveryImage}
                      sizes="(max-width: 767px) 76vw, 440px"
                    />
                  </div>
                ) : null}
              </section>
            ) : null}

            {scheduleChapter && brandingVisual && tripSheetVisual ? (
              <section className={styles.section} aria-labelledby="weekly-work-title">
                <SectionIntro intro={scheduleChapter} headingId="weekly-work-title" />
                <div className={styles.featureRow}>
                  <div>
                    <h3 className={styles.featureTitle}>Each tenant has its own identity and operating rules.</h3>
                    <p className={styles.featureSummary}>
                      Branding, role labels, tariffs, and service areas are configured per tenant. Saffron Routes is a demo tenant.
                    </p>
                  </div>
                  <VisualFigure
                    visual={brandingVisual}
                    className={styles.featureFigure}
                    frameClassName={styles.featureFrame}
                    sizes="(max-width: 767px) 100vw, 720px"
                  />
                </div>
                <div className={styles.scheduleProof}>
                  <p className={styles.featureSummary}>
                    Weekly trip templates create scheduled requests. The trip sheet groups work by time and supports CSV export.
                  </p>
                  <VisualFigure
                    visual={tripSheetVisual}
                    className={styles.tripSheetFigure}
                    frameClassName={styles.tripSheetFrame}
                    sizes="(max-width: 767px) 100vw, 1200px"
                  />
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <LegacyGallery detail={detail} />
        )}

        <section className={styles.section} aria-labelledby="architecture-title">
          <SectionIntro intro={detail.sectionIntros.architecture} headingId="architecture-title" />
          <div className={styles.architectureGrid}>
            {detail.architectureSections.map((section, index) => (
              <article className={styles.architectureCard} key={section.title}>
                <p className={styles.cardIndex}>0{index + 1}</p>
                <h3 className={styles.cardTitle}>{section.title}</h3>
                <p className={styles.cardDescription}>{section.description}</p>
                <ul className={styles.cardList}>
                  {section.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.systemsBand}`} aria-labelledby="stack-title">
          <SectionIntro intro={detail.sectionIntros.stack} headingId="stack-title" />
          <div className={styles.stackGrid}>
            {detail.stackBuckets.map((bucket) => (
              <article className={styles.stackCard} key={bucket.label}>
                <h3 className={styles.cardTitle}>{bucket.label}</h3>
                <ul className={styles.stackList}>
                  {bucket.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.qualitySection}`} aria-labelledby="quality-title">
          <div className={styles.qualityPanel}>
            <SectionIntro intro={detail.sectionIntros.quality} headingId="quality-title" />
            <ul className={styles.qualityList}>
              {detail.qualityHighlights.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        {detail.references?.length ? (
          <section className={styles.section} aria-labelledby="references-title">
            <SectionIntro intro={detail.sectionIntros.references} headingId="references-title" />
            <div className={styles.referenceLinks}>
              {detail.references.map((reference) => reference.href ? (
                <a
                  key={reference.label}
                  href={reference.href}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.referenceLink}
                >
                  {reference.label}
                </a>
              ) : null)}
            </div>
          </section>
        ) : null}

        <section className={`${styles.section} ${styles.contactBand}`} aria-labelledby="detail-contact-title">
          <h2 id="detail-contact-title" className={styles.sectionTitle}>Let&apos;s build.</h2>
          <p className={styles.sectionSummary}>
            I build and ship systems like this end to end. Email me, or start from the résumé.
          </p>
          <div className={styles.contactActions}>
            <a className={styles.contactPrimary} href={`mailto:${personal.email}`}>
              Email Abhinav
            </a>
            <a className={styles.contactSecondary} href={personal.resumeHref} download>
              Download résumé
            </a>
            {personal.socials
              .filter((social) => social.platform !== "email")
              .map((social) => (
                <a
                  key={social.platform}
                  className={styles.contactSecondary}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {social.label}
                </a>
              ))}
          </div>
        </section>
      </main>

      <Footer personal={personal} />
    </div>
  );
}
