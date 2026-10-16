"use client";

import Image from "next/image";
import Link from "next/link";
import type { PersonalData, ProjectDetail, ProjectStoryChapter, ProjectStoryVisual, ProjectTenantOption } from "@/types";
import Footer from "@/components/layout/Footer";
import DispatchReel from "@/components/sections/project-detail/DispatchReel";
import TenantSwitcher from "@/components/sections/project-detail/TenantSwitcher";
import VeloRoutePlate from "@/components/sections/project-detail/VeloRoutePlate";
import styles from "./ProjectDetailPage.module.css";

interface ProjectDetailPageProps {
  detail: ProjectDetail;
  personal: PersonalData;
}

function SectionIntro({ chapter, headingId }: { chapter: ProjectStoryChapter; headingId: string }) {
  return (
    <div className={styles.sectionIntro}>
      <p className={styles.eyebrow}>{chapter.eyebrow}</p>
      <h2 id={headingId} className={styles.sectionTitle}>{chapter.title}</h2>
      <p className={styles.sectionSummary}>{chapter.summary}</p>
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
          <Link href="/#work" className={styles.backLink}>
            ← Back to Works
          </Link>
          <span className={styles.chromeLabel}>Project file</span>
        </div>
      </header>

      <main className={`content-container ${styles.main}`}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{detail.eyebrow}</p>
            {storyboard ? <p className={styles.statusStamp}>Pre-launch working demo</p> : null}
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
                sizes="(max-width: 767px) 100vw, (max-width: 1100px) 54vw, 650px"
              />
            </div>
            <figcaption className={styles.figureCaption}>{detail.heroImage.caption}</figcaption>
          </figure>
        </section>

        {storyboard ? (
          <div className={styles.factRail} aria-label="Project facts">
            <p><span>Stage</span>Pre-launch working demo</p>
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
                <SectionIntro chapter={tenantChapter} headingId="tenant-story-title" />
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
                <SectionIntro chapter={liveryChapter} headingId="livery-story-title" />
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
                <SectionIntro chapter={scheduleChapter} headingId="weekly-work-title" />
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
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>05 / Under the map</p>
            <h2 id="architecture-title" className={styles.sectionTitle}>How the system is put together.</h2>
            <p className={styles.sectionSummary}>One shared backend supports each branded workspace and the trip lifecycle.</p>
          </div>
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
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>06 / Tools</p>
            <h2 id="stack-title" className={styles.sectionTitle}>Tools behind the demo.</h2>
          </div>
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
            <p className={styles.eyebrow}>07 / Quality</p>
            <h2 id="quality-title" className={styles.sectionTitle}>What the checks cover.</h2>
            <ul className={styles.qualityList}>
              {detail.qualityHighlights.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        {detail.references?.length ? (
          <section className={styles.section} aria-labelledby="references-title">
            <p className={styles.eyebrow}>08 / Source</p>
            <h2 id="references-title" className={styles.sectionTitle}>Read the project source.</h2>
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
      </main>

      <Footer personal={personal} />
    </div>
  );
}
