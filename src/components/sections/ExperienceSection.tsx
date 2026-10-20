"use client";

import * as m from "motion/react-m";
import { useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ChronicleEntry, ExperiencePoint, SectionTone } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import ClipReveal from "@/components/motion/ClipReveal";
import RevealText from "@/components/motion/RevealText";
import styles from "./ExperienceSection.module.css";

interface ExperienceSectionProps {
  experiences: ChronicleEntry[];
  tone?: SectionTone;
}

interface ExperienceDossierProps {
  experience: ChronicleEntry;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}

function pointHeading(point: ExperiencePoint): string {
  return point.emphasis
    ? `${point.lead} ${point.emphasis},`
    : `${point.lead}.`;
}

function ExperienceDossier({ experience, progress }: ExperienceDossierProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = experience.slug === "ostrum-database-engineer"
    ? "experience-full"
    : `${experience.slug}-full-experience`;
  const toggleId = `${panelId}-toggle`;
  const companyId = `${experience.slug}-employer`;
  const sectionCount = experience.workstreams.length;
  const pointCount = experience.workstreams.reduce(
    (count, workstream) => count + workstream.points.length,
    0
  );
  const dotY = useTransform(progress, [0, 1], [0, 116]);

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === `#${panelId}`) {
        setIsExpanded(true);
      }
    };

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [panelId]);

  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : isExpanded
      ? {
          height: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
          opacity: { duration: 0.18, ease: "easeOut" as const },
        }
      : {
          height: { duration: 0.22, ease: "easeIn" as const },
          opacity: { duration: 0.14, ease: "easeIn" as const },
        };

  return (
    <article className={styles.experienceEntry} aria-labelledby={companyId}>
      <aside className={styles.employerRail} aria-label="At work" data-experience-rail="true">
        <p className={styles.atWork}>At work</p>
        <h3 id={companyId} className={styles.employerName}>
          {experience.company}
        </h3>
        <p className={styles.roleTitle}>{experience.roleTitle}</p>
        <p className={styles.period}>{experience.period}</p>
        <div className={styles.progressTrack} aria-hidden="true" data-experience-progress="true">
          <m.span
            className={styles.progressFill}
            style={{ scaleY: prefersReducedMotion ? 1 : progress }}
            data-experience-progress-fill="true"
          />
          <m.span
            className={styles.progressDot}
            style={{ y: prefersReducedMotion ? 116 : dotY }}
          />
        </div>
      </aside>

      <div className={styles.experienceContent} data-experience-content="true">
        <p className={styles.employmentNote}>{experience.employmentNote}</p>
        <p className={styles.roleScope}>{experience.roleScope}</p>

        <ul className={styles.pointList} aria-label="Role summary">
          {experience.summaryPoints.map((point, index) => (
            <li className={styles.summaryPoint} key={`${point.lead}-${point.detail}`}>
              <h4 className={styles.pointHeading} aria-label={pointHeading(point)}>
                <RevealText
                  as="span"
                  text={pointHeading(point)}
                  className={styles.pointHeadingReveal}
                  delay={index * 35}
                />
              </h4>
              <p>{point.detail}</p>
            </li>
          ))}
        </ul>

        <div className={styles.detailDisclosure}>
          <button
            id={toggleId}
            type="button"
            className={styles.disclosureButton}
            aria-expanded={isExpanded}
            aria-controls={panelId}
            onClick={() => setIsExpanded((expanded) => !expanded)}
          >
            <span className={styles.disclosureLabel}>
              {isExpanded ? "Close full experience" : "Read full experience"}
            </span>
            <span className={styles.disclosureMeta}>
              {sectionCount} sections, {pointCount} points
            </span>
            <svg
              className={styles.disclosureMark}
              data-expanded={isExpanded}
              viewBox="0 0 20 20"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M10 3v14M3 10h14" />
            </svg>
          </button>

          <m.div
            id={panelId}
            className={styles.detailPanel}
            role="region"
            aria-labelledby={toggleId}
            aria-hidden={!isExpanded}
            inert={!isExpanded}
            initial={false}
            animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
            transition={panelTransition}
          >
            <div className={styles.detailContent}>
              <div className={styles.workstreamGrid}>
                {experience.workstreams.map((workstream, index) => {
                  const itemTransition = prefersReducedMotion
                    ? { duration: 0 }
                    : isExpanded
                      ? {
                          duration: 0.18,
                          delay: index * 0.03,
                          ease: [0.22, 1, 0.36, 1] as const,
                        }
                      : { duration: 0.14, ease: "easeIn" as const };

                  return (
                    <m.section
                      key={workstream.id}
                      className={styles.workstream}
                      data-workstream={workstream.id}
                      initial={false}
                      animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 8 }}
                      transition={itemTransition}
                    >
                      <h4>{workstream.title}</h4>
                      <p className={styles.workstreamSummary}>{workstream.summary}</p>
                      <ul className={styles.workstreamPoints}>
                        {workstream.points.map((point) => (
                          <li key={`${point.lead}-${point.detail}`}>
                            <strong>{pointHeading(point)}</strong> {point.detail}
                          </li>
                        ))}
                      </ul>

                      {workstream.images?.length ? (
                        <div className={styles.toolkitFigureGrid}>
                          {workstream.images.map((image) => (
                            <ClipReveal
                              className={styles.toolkitClip}
                              key={image.src}
                            >
                              <figure className={styles.toolkitFigure}>
                                <Image
                                  src={image.src}
                                  alt={image.alt}
                                  width={image.width}
                                  height={image.height}
                                  sizes="(max-width: 767px) 100vw, (max-width: 1199px) 43vw, 520px"
                                  loading="lazy"
                                  className={styles.toolkitImage}
                                />
                                <figcaption>{image.caption}</figcaption>
                              </figure>
                            </ClipReveal>
                          ))}
                        </div>
                      ) : null}

                      <ul className={styles.toolTags} aria-label={`${workstream.title} technologies`}>
                        {workstream.tools.map((tool) => (
                          <li key={tool}>{tool}</li>
                        ))}
                      </ul>
                    </m.section>
                  );
                })}
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </article>
  );
}

export default function ExperienceSection({
  experiences,
  tone,
}: ExperienceSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: prefersReducedMotion ? undefined : sectionRef,
    offset: ["start end", "end start"],
  });

  if (experiences.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="experience" tone={tone} className={styles.experienceSection}>
      <div ref={sectionRef} className={styles.experienceRoot}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.heading}>
            <RevealText text="Experience" as="span" className={styles.headingReveal} />
          </h2>
        </header>

        <div className={styles.experienceList}>
          {experiences.map((experience) => (
            <ExperienceDossier
              key={experience.slug}
              experience={experience}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
