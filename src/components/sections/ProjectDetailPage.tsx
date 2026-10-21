import Image from "next/image";
import Link from "next/link";
import { preload } from "react-dom";
import type { CSSProperties } from "react";
import type {
  PersonalData,
  ProjectDetail,
  ProjectStoryVisual,
  ProjectTenantOption,
} from "@/types";
import Footer from "@/components/layout/Footer";
import DispatchReel from "@/components/sections/project-detail/DispatchReel";
import { getMobileHeroAvif } from "@/components/sections/project-detail/mobileHeroVariants";
import TenantSwitcher from "@/components/sections/project-detail/TenantSwitcher";
import VeloRoutePlate from "@/components/sections/project-detail/VeloRoutePlate";
import styles from "./ProjectDetailPage.module.css";

interface ProjectDetailPageProps {
  detail: ProjectDetail;
  personal: PersonalData;
  nextCaseStudy?: { slug: string; title: string };
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

function LegacyGallery({ detail }: { detail: ProjectDetail }) {
  if (detail.gallery.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="gallery-title">
      <p className={styles.eyebrow}>Project visuals</p>
      <h2 id="gallery-title" className={styles.sectionTitle}>Screens from the build</h2>
      <div className={styles.legacyGallery} data-count={detail.gallery.length}>
        {detail.gallery.map((visual) => (
          <figure className={styles.legacyFigure} key={visual.src}>
            <div
              className={styles.legacyFrame}
              data-gallery-portrait={visual.frameAspectRatio && visual.frameAspectRatio < 1 ? "true" : undefined}
              style={visual.frameAspectRatio
                ? { "--gallery-aspect-ratio": visual.frameAspectRatio } as CSSProperties
                : undefined}
            >
              <Image
                src={visual.src}
                alt={visual.alt}
                fill
                sizes={detail.gallery.length > 2
                  ? "(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
                  : "(max-width: 767px) 100vw, 50vw"}
              />
            </div>
            <figcaption className={styles.figureCaption}>{visual.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default function ProjectDetailPage({ detail, personal, nextCaseStudy }: ProjectDetailPageProps) {
  const storyboard = detail.storyboard;
  const visuals = storyboard?.visuals ?? [];
  const getVisual = (id: string) => visuals.find((visual) => visual.id === id);
  const mobileHeroVisual = storyboard ? getVisual(storyboard.mobileHeroVisualId) : undefined;
  const mobileHeroAvif = mobileHeroVisual ? getMobileHeroAvif(mobileHeroVisual.src) : undefined;
  const switcherOptions: ProjectTenantOption[] = storyboard?.tenantSwitcher.options ?? [];
  const tripVisuals = storyboard?.tripSteps.flatMap((step) => {
    const visual = getVisual(step.visualId);
    return visual ? [visual] : [];
  }) ?? [];
  const tenantVisuals = switcherOptions.flatMap((option) => {
    const visual = getVisual(option.visualId);
    return visual ? [visual] : [];
  });

  if (mobileHeroVisual) {
    preload(mobileHeroAvif ?? mobileHeroVisual.src, {
      as: "image",
      ...(mobileHeroAvif ? { type: "image/avif" } : {}),
      media: "(max-width: 767px)",
      fetchPriority: "high",
    });
  }

  return (
    <div className={styles.pageShell} id="page-top">
      <a className={styles.skipLink} href="#project-content">Skip to project content</a>
      <header className={styles.chrome}>
        <div className={`content-container ${styles.chromeInner}`}>
          <Link href="/#work" prefetch={false} className={styles.backLink}>
            ← Back to work
          </Link>
          <span className={styles.chromeLabel}>{detail.title}</span>
        </div>
      </header>

      <main id="project-content" tabIndex={-1} className={`content-container ${styles.main}`}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{detail.eyebrow}</p>
            {storyboard?.status ? <p className={styles.statusStamp}>{storyboard.status}</p> : null}
            <h1 className={styles.title}>{detail.title}</h1>
            <p className={styles.subtitle}>{detail.subtitle}</p>
            {detail.roleLine
              ? <p className={styles.roleLine}>{detail.roleLine}</p>
              : <p className={styles.scopeSummary}>{detail.scopeSummary}</p>}
            {detail.hardPart ? (
              <div className={styles.hardPart}>
                <p className={styles.hardPartLabel}>{detail.hardPart.label}</p>
                <p className={styles.hardPartCopy}>{detail.hardPart.copy}</p>
              </div>
            ) : null}
            {storyboard?.routePlate ? <VeloRoutePlate /> : null}
          </div>

          <figure className={styles.heroFigure}>
            <div className={styles.heroMedia} data-mobile-preview={mobileHeroVisual ? "true" : undefined}>
              <picture className={styles.heroPicture}>
                {mobileHeroAvif ? (
                  <source media="(max-width: 767px)" type="image/avif" srcSet={mobileHeroAvif} />
                ) : null}
                {mobileHeroVisual ? (
                  <source media="(max-width: 767px)" srcSet={mobileHeroVisual.src} />
                ) : null}
                <Image
                  src={detail.heroImage.src}
                  alt={detail.heroImage.alt}
                  fill
                  preload={!mobileHeroVisual}
                  fetchPriority={mobileHeroVisual ? "high" : undefined}
                  loading={mobileHeroVisual ? "eager" : undefined}
                  className={styles.heroImage}
                  sizes="(max-width: 767px) calc(100vw - 3rem), (max-width: 1023px) 43vw, (max-width: 1100px) 54vw, 760px"
                />
              </picture>
            </div>
            <figcaption className={styles.figureCaption}>{detail.heroImage.caption}</figcaption>
          </figure>
        </section>

        {storyboard ? (
          <div className={styles.factRail} role="group" aria-label="Project facts">
            {storyboard.facts.map((fact) => (
              <p key={fact.label}><span>{fact.label}</span>{fact.value}</p>
            ))}
          </div>
        ) : null}

        {storyboard ? (
          <>
            <section className={styles.section} aria-labelledby={`${detail.slug}-trip-story-title`}>
              <SectionIntro intro={storyboard.tripIntro} headingId={`${detail.slug}-trip-story-title`} />
              <DispatchReel steps={storyboard.tripSteps} visuals={tripVisuals} />
            </section>

            {storyboard.chapters.map((chapter) => {
              const headingId = `${detail.slug}-${chapter.id}-title`;
              const chapterVisuals = chapter.visualIds.flatMap((id) => {
                const visual = getVisual(id);
                return visual ? [visual] : [];
              });

              if (chapter.layout === "tenant-switcher") {
                return (
                  <section className={`${styles.section} ${styles.tenantSection}`} aria-labelledby={headingId} key={chapter.id}>
                    <SectionIntro intro={chapter} headingId={headingId} />
                    <TenantSwitcher
                      label={storyboard.tenantSwitcher.label}
                      defaultId={storyboard.tenantSwitcher.defaultId}
                      options={switcherOptions}
                      visuals={tenantVisuals}
                    />
                  </section>
                );
              }

              if (chapter.layout === "theme-comparison") {
                const mobileProofVisual = storyboard.mobileProof
                  ? getVisual(storyboard.mobileProof.visualId)
                  : undefined;
                return (
                  <section className={styles.section} aria-labelledby={headingId} key={chapter.id}>
                    <SectionIntro intro={chapter} headingId={headingId} />
                    {chapterVisuals.length >= 2 ? (
                      <div className={styles.liveryPair}>
                        {chapterVisuals.slice(0, 2).map((visual) => (
                          <VisualFigure
                            key={visual.id}
                            visual={visual}
                            className={styles.liveryFigure}
                            frameClassName={styles.liveryFrame}
                            imageClassName={styles.liveryImage}
                            sizes="(max-width: 767px) 100vw, 600px"
                          />
                        ))}
                      </div>
                    ) : null}
                    {storyboard.mobileProof && mobileProofVisual ? (
                      <div className={styles.mobileProof}>
                        <div>
                          <h3 className={styles.featureTitle}>{storyboard.mobileProof.title}</h3>
                          <p className={styles.featureSummary}>{storyboard.mobileProof.summary}</p>
                        </div>
                        <VisualFigure
                          visual={mobileProofVisual}
                          className={styles.mobileLiveryFigure}
                          frameClassName={styles.mobileLiveryFrame}
                          imageClassName={styles.liveryImage}
                          sizes="(max-width: 767px) 76vw, 440px"
                        />
                      </div>
                    ) : null}
                  </section>
                );
              }

              const featureProofVisual = storyboard.featureProof
                ? getVisual(storyboard.featureProof.visualId)
                : undefined;
              const scheduleProofVisual = storyboard.scheduleProof
                ? getVisual(storyboard.scheduleProof.visualId)
                : undefined;
              return (
                <section className={styles.section} aria-labelledby={headingId} key={chapter.id}>
                  <SectionIntro intro={chapter} headingId={headingId} />
                  {storyboard.featureProof && featureProofVisual ? (
                    <div className={styles.featureRow}>
                      <div>
                        <h3 className={styles.featureTitle}>{storyboard.featureProof.title}</h3>
                        <p className={styles.featureSummary}>{storyboard.featureProof.summary}</p>
                      </div>
                      <VisualFigure
                        visual={featureProofVisual}
                        className={styles.featureFigure}
                        frameClassName={styles.featureFrame}
                        sizes="(max-width: 767px) 100vw, 720px"
                      />
                    </div>
                  ) : null}
                  {storyboard.scheduleProof && scheduleProofVisual ? (
                    <div className={styles.scheduleProof}>
                      <p className={styles.featureSummary}>{storyboard.scheduleProof.summary}</p>
                      <VisualFigure
                        visual={scheduleProofVisual}
                        className={styles.tripSheetFigure}
                        frameClassName={styles.tripSheetFrame}
                        sizes="(max-width: 767px) 100vw, 1200px"
                      />
                    </div>
                  ) : null}
                </section>
              );
            })}
          </>
        ) : (
          <LegacyGallery detail={detail} />
        )}

        <section className={styles.section} aria-labelledby="architecture-title">
          <SectionIntro intro={detail.sectionIntros.architecture} headingId="architecture-title" />
          <div className={styles.architectureGrid}>
            {detail.architectureSections.map((section, index) => (
              <article className={styles.architectureCard} data-architecture-card="true" key={section.title}>
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

        {detail.qualityHighlights.length > 0 ? (
          <section className={`${styles.section} ${styles.qualitySection}`} aria-labelledby="quality-title">
            <div className={styles.qualityPanel} data-quality-panel="true">
              <SectionIntro intro={detail.sectionIntros.quality} headingId="quality-title" />
              <ul className={styles.qualityList}>
                {detail.qualityHighlights.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </section>
        ) : null}

        {detail.references?.length ? (
          <section className={styles.section} aria-labelledby="references-title">
            <SectionIntro intro={detail.sectionIntros.references} headingId="references-title" />
            <div className={styles.referenceLinks}>
              {detail.references.map((reference) => reference.href ? (
                <a
                  key={reference.label}
                  href={reference.href}
                  target="_blank"
                  rel="noopener noreferrer"
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
            Full-time roles, contract work or a scoped project: all welcome.
          </p>
          <div className={styles.contactActions}>
            <a className={styles.contactPrimary} href={`mailto:${personal.email}`}>
              Email {personal.name}
            </a>
            <a className={styles.contactSecondary} href={personal.resumeHref} download>
              Download résumé
            </a>
            {personal.socials
              .filter((social) => social.platform === "linkedin")
              .map((social) => (
                <a
                  key={social.platform}
                  className={styles.contactSecondary}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Connect on {social.label}
                </a>
              ))}
          </div>
        </section>

        {nextCaseStudy ? (
          <section className={styles.nextCaseStudy} aria-label="Next case study">
            <Link
              className={styles.nextCaseStudyLink}
              href={`/work/${nextCaseStudy.slug}`}
              aria-label={`Next case study: ${nextCaseStudy.title}`}
            >
              <span className={styles.nextCaseStudyLabel}>Next case study</span>
              <span className={styles.nextCaseStudyTitle}>{nextCaseStudy.title}</span>
            </Link>
          </section>
        ) : null}
      </main>

      <Footer personal={personal} topTargetId="page-top" />
    </div>
  );
}
