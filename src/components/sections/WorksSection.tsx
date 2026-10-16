"use client";

import Link from "next/link";
import Image from "next/image";
import * as m from "motion/react-m";
import { useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import type { OrchestrationContent, Project, SectionTone } from "@/types";
import { useCardTilt } from "@/hooks/useCardTilt";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { tiltSpring } from "@/lib/animations";
import { renderIcon, cn } from "@/lib/utils";
import Tag from "@/components/ui/Tag";
import SectionWrapper from "@/components/ui/SectionWrapper";
import RisoMark from "@/components/ui/RisoMark";
import FlipRevealText from "@/components/ui/FlipRevealText";
import CaseNumeral from "@/components/art/CaseNumeral";
import PrintRunPoster from "@/components/art/PrintRunPoster";
import VeloRoutePlate from "@/components/art/VeloRoutePlate";
import styles from "./WorksSection.module.css";

// =============================================================================
// WorksSection — Project showcase with alternating layouts and card tilt
// =============================================================================

interface WorksSectionProps {
  projects: Project[];
  orchestration: OrchestrationContent;
  featuredProofLine?: string;
  tone?: SectionTone;
}

export default function WorksSection({
  projects,
  orchestration,
  featuredProofLine,
  tone,
}: WorksSectionProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <WorksSectionContent
      projects={projects}
      orchestration={orchestration}
      featuredProofLine={featuredProofLine}
      tone={tone}
    />
  );
}

function WorksSectionContent({
  projects,
  orchestration,
  featuredProofLine,
  tone,
}: WorksSectionProps) {
  return (
    <SectionWrapper
      id="work"
      tone={tone}
      className={styles.worksSection}
    >
      <div className={styles.sectionHeader}>
        <RisoMark variant="discs" />
        <h2 className={styles.heading}>
          <FlipRevealText
            static
            overprint
            text="Selected work"
            mode="word"
            className={styles.headingFlip}
            tokenClassName={styles.headingFlipToken}
          />
        </h2>
        <p className={styles.callout}>
          Systems that ship
        </p>
      </div>

      <div className={styles.projectsList}>
        {projects.map((project) => (
          <WorkCard key={project.id} project={project} />
        ))}
      </div>

      <OrchestrationEvidence
        content={orchestration}
        featuredProofLine={featuredProofLine}
      />
    </SectionWrapper>
  );
}

function OrchestrationEvidence({
  content,
  featuredProofLine,
}: {
  content: OrchestrationContent;
  featuredProofLine?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const posterRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: prefersReducedMotion ? undefined : posterRef,
    offset: ["start end", "end start"],
  });

  return (
    <aside className={styles.orchestrationStrip} aria-labelledby="work-method-title">
      <div className={styles.orchestrationLead}>
        <div ref={posterRef} className={styles.posterColumn}>
          <PrintRunPoster
            progress={scrollYProgress}
            reducedMotion={prefersReducedMotion}
          />
        </div>
        <div className={styles.evidenceHeading}>
          <h3 id="work-method-title">How I orchestrate AI agents</h3>
          <p>{content.metricsContext}</p>
        </div>
      </div>

      <div className={styles.evidenceContent}>
        {featuredProofLine ? (
          <p className={styles.featuredProof}>{featuredProofLine}</p>
        ) : null}
        <p className={styles.orchestrationIntro}>{content.intro}</p>
        <p className={styles.method}>{content.method}</p>
        <ol className={styles.methodLanes} aria-label="Four method lanes">
          <li>Scope</li>
          <li>Isolate</li>
          <li>Review</li>
          <li>Rehearse</li>
        </ol>

        <ul className={styles.metrics}>
          {content.metrics.map((metric) => (
            <li key={metric.label}>
              <span className={styles.metricValue}>{metric.value}</span>
              <span className={styles.metricLabel}>{metric.label}</span>
            </li>
          ))}
        </ul>
        <p className={styles.lesson}>{content.lesson}</p>
      </div>
    </aside>
  );
}

// ─── WorkCard Sub-component ─────────────────────────────────────────

function WorkCard({ project }: { project: Project }) {
  const prefersReducedMotion = useReducedMotion();
  const { ref: tiltRef, tilt } = useCardTilt(1.5);
  // Scroll anchor is the plain content panel below — passing a motion-component
  // ref to useScroll can throw "Target ref is defined but not hydrated".
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: prefersReducedMotion ? undefined : cardRef,
    offset: ["start end", "end start"],
  });
  // Subtle scroll-linked drift on the media so the card feels alive while scrolling.
  const visualY = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const screenshots = project.screenshots ?? [];
  const [heroScreenshot, ...supportScreenshots] = screenshots;
  const hasScreenshots = Boolean(heroScreenshot);
  const hasProjectLinks = (project.links?.length ?? 0) > 0;
  const hasDeepDive = Boolean(project.detailSlug);
  const isTeaserOnly = hasDeepDive;
  const visibleSupportShots = isTeaserOnly ? [] : supportScreenshots.slice(0, 2);
  const showProjectLinks = hasProjectLinks && !hasDeepDive;
  const deepDiveLabel = project.detailCtaLabel ?? "Open deep dive";
  const isVeloProject = project.detailSlug === "velo";

  return (
    <div className={styles.workCard}>
      {/* Visual Panel */}
      <m.div
        ref={prefersReducedMotion ? undefined : tiltRef}
        animate={prefersReducedMotion ? {} : { rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
        transition={tiltSpring}
        style={{ transformPerspective: 800, y: prefersReducedMotion ? 0 : visualY }}
        className={cn(
          styles.visualPanel,
          hasScreenshots && styles.visualPanelRich,
          isVeloProject && styles.visualPanelVelo,
          project.reversed && styles.visualReversed
        )}
      >
        {hasScreenshots && heroScreenshot ? (
          <div className={styles.visualMediaStack}>
            <div className={styles.heroShot}>
              <Image
                src={heroScreenshot.src}
                alt={heroScreenshot.alt}
                fill
                className={styles.heroShotImage}
                sizes="(max-width: 768px) 100vw, 56vw"
              />
              <div className={styles.mediaCaption}>{heroScreenshot.caption}</div>
            </div>

            {isVeloProject && (
              <div className={styles.routePlateWrap}>
                <VeloRoutePlate />
              </div>
            )}

            {visibleSupportShots.length > 0 && (
              <div className={styles.supportShots}>
                {visibleSupportShots.map((shot) => (
                  <div key={shot.src} className={styles.supportShot}>
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      fill
                      className={styles.supportShotImage}
                      sizes="(max-width: 768px) 48vw, 18vw"
                    />
                    <div className={styles.supportCaption}>{shot.caption}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={`dot-grid ${styles.dotOverlay}`} />
            <m.div
              whileHover={prefersReducedMotion ? undefined : { scale: 1.1, rotate: 5 }}
              className={styles.iconWrapper}
            >
              {renderIcon(project.icon, {
                size: 48,
                style: { color: "rgba(var(--color-primary-brand-rgb), 0.58)" },
              })}
            </m.div>
          </>
        )}
      </m.div>

      {/* Content Panel — also the scroll anchor for the visual parallax */}
      <div
        ref={cardRef}
        className={cn(
          styles.contentPanel,
          project.reversed && styles.contentReversed
        )}
      >
        <div className={styles.caseMarker}>
          <CaseNumeral number={project.id} />
          <span className={styles.caseNumber}>Case {project.id}</span>
        </div>
        <h3 className={styles.projectTitle}>{project.title}</h3>
        <p className={styles.projectDesc}>{project.description}</p>
        {project.tags.length > 0 && (
          <div className={styles.projectTags}>
            {project.tags.map((tag) => (
              <Tag key={tag} label={tag} variant="subtle" />
            ))}
          </div>
        )}

        {!isTeaserOnly && project.architectureHighlights?.length ? (
          <div className={styles.infoBlock}>
            <h4 className={styles.infoTitle}>Architecture highlights</h4>
            <ul className={styles.infoList}>
              {project.architectureHighlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {!isTeaserOnly && project.techBuckets?.length ? (
          <div className={styles.infoBlock}>
            <h4 className={styles.infoTitle}>Technology coverage</h4>
            <div className={styles.techBuckets}>
              {project.techBuckets.map((bucket) => (
                <div key={bucket.label} className={styles.techBucket}>
                  <span className={styles.techBucketLabel}>{bucket.label}</span>
                  <div className={styles.techBucketItems}>
                    {bucket.items.map((item) => (
                      <span key={item} className={styles.techChip}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {hasDeepDive ? (
          <div className={styles.deepDiveCta}>
            <Link href={`/work/${project.detailSlug}`} className={styles.deepDiveLink}>
              {deepDiveLabel} <ChevronRight size={16} />
            </Link>
            {project.detailCtaSubline ? (
              <span className={styles.deepDiveSubline}>{project.detailCtaSubline}</span>
            ) : null}
          </div>
        ) : null}

        {showProjectLinks ? (
          <div className={styles.projectLinks} aria-label={`${project.title} links`}>
            {project.links?.map((link) =>
              link.href ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.projectLink}
                >
                  {link.label}
                </a>
              ) : (
                <span
                  key={link.label}
                  className={cn(styles.projectLink, styles.projectLinkDisabled)}
                  aria-disabled="true"
                >
                  {link.label}
                </span>
              )
            )}
          </div>
        ) : !hasDeepDive ? (
          <span className={styles.caseStudyLink} title="Coming soon">
            View case study <ChevronRight size={18} />
          </span>
        ) : null}
      </div>
    </div>
  );
}
