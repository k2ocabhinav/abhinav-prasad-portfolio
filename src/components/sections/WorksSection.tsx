"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import type { SectionBlendStyle, SectionTone } from "@/types";
import { projects } from "@/data/projects";
import { useCardTilt } from "@/hooks/useCardTilt";
import { staggerContainer, staggerItem, tiltSpring } from "@/lib/animations";
import { renderIcon, cn } from "@/lib/utils";
import Tag from "@/components/ui/Tag";
import SectionWrapper from "@/components/ui/SectionWrapper";
import styles from "./WorksSection.module.css";

// =============================================================================
// WorksSection — Project showcase with alternating layouts and card tilt
// =============================================================================

interface WorksSectionProps {
  tone?: SectionTone;
  blendTopFrom?: SectionTone;
  blendBottomTo?: SectionTone;
  blendStyle?: SectionBlendStyle;
}

export default function WorksSection({
  tone,
  blendTopFrom,
  blendBottomTo,
  blendStyle,
}: WorksSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <SectionWrapper
      id="work"
      tone={tone}
      blendTopFrom={blendTopFrom}
      blendBottomTo={blendBottomTo}
      blendStyle={blendStyle}
    >
      <div ref={sectionRef} className={styles.sectionHeader}>
        <motion.h2
          style={{ y: headingY }}
          className={styles.heading}
        >
          Selected Works
        </motion.h2>
      </div>

      <motion.div
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className={styles.projectsList}
      >
        {projects.map((project, i) => (
          <WorkCard key={i} project={project} />
        ))}
      </motion.div>
    </SectionWrapper>
  );
}

// ─── WorkCard Sub-component ─────────────────────────────────────────

function WorkCard({ project }: { project: (typeof projects)[number] }) {
  const { ref: tiltRef, tilt } = useCardTilt();
  const screenshots = project.screenshots ?? [];
  const [heroScreenshot, ...supportScreenshots] = screenshots;
  const hasScreenshots = Boolean(heroScreenshot);
  const hasProjectLinks = (project.links?.length ?? 0) > 0;
  const hasDeepDive = Boolean(project.detailSlug);
  const isTeaserOnly = hasDeepDive;
  const visibleSupportShots = isTeaserOnly ? [] : supportScreenshots.slice(0, 2);
  const showProjectLinks = hasProjectLinks && !hasDeepDive;
  const deepDiveLabel = project.detailCtaLabel ?? "Open Deep Dive";

  return (
    <motion.div variants={staggerItem} className={styles.workCard}>
      {/* Visual Panel */}
      <motion.div
        ref={tiltRef}
        animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
        whileHover={{ scale: 1.02 }}
        transition={tiltSpring}
        style={{ transformPerspective: 800 }}
        className={cn(
          styles.visualPanel,
          "glass-card",
          hasScreenshots && styles.visualPanelRich,
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
                priority={project.id === "01"}
              />
              <div className={styles.mediaCaption}>{heroScreenshot.caption}</div>
            </div>

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
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={styles.iconWrapper}
            >
              {renderIcon(project.icon, {
                size: 48,
                style: { color: "rgba(var(--color-primary-brand-rgb), 0.58)" },
              })}
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Content Panel */}
      <div
        className={cn(
          styles.contentPanel,
          project.reversed && styles.contentReversed
        )}
      >
        <span className={styles.caseNumber}>Case {project.id}</span>
        <h3 className={styles.projectTitle}>{project.title}</h3>
        <p className={styles.projectDesc}>{project.description}</p>
        {project.scopeSummary && (
          <p className={styles.scopeSummary}>{project.scopeSummary}</p>
        )}
        {project.tags.length > 0 && (
          <div className={styles.projectTags}>
            {project.tags.map((tag) => (
              <Tag key={tag} label={tag} variant="subtle" />
            ))}
          </div>
        )}

        {!isTeaserOnly && project.architectureHighlights?.length ? (
          <div className={styles.infoBlock}>
            <h4 className={styles.infoTitle}>Architecture Highlights</h4>
            <ul className={styles.infoList}>
              {project.architectureHighlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {!isTeaserOnly && project.techBuckets?.length ? (
          <div className={styles.infoBlock}>
            <h4 className={styles.infoTitle}>Technology Coverage</h4>
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
            View Case Study <ChevronRight size={18} />
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
