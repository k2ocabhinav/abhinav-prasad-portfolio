"use client";

import * as m from "motion/react-m";
import { useScroll } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ChronicleEntry, ExperiencePoint, SectionTone } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import RisoMark from "@/components/ui/RisoMark";
import FlipRevealText from "@/components/ui/FlipRevealText";
import styles from "./ExperienceSection.module.css";

interface ExperienceSectionProps {
  experiences: ChronicleEntry[];
  tone?: SectionTone;
}

interface ExperienceDossierProps {
  experience: ChronicleEntry;
}

function ExperiencePointText({ point }: { point: ExperiencePoint }) {
  if (point.emphasis) {
    return (
      <>
        <strong>{point.lead} <span>{point.emphasis}</span></strong>, {point.detail}
      </>
    );
  }

  return (
    <>
      <strong>{point.lead}.</strong> {point.detail}
    </>
  );
}

function ExperienceDossier({ experience }: ExperienceDossierProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = experience.slug === "ostrum-database-engineer"
    ? "experience-full"
    : `${experience.slug}-full-experience`;
  const toggleId = `${panelId}-toggle`;
  const headingId = `${experience.slug}-employer`;
  const sectionCount = experience.workstreams.length;
  const pointCount = experience.workstreams.reduce(
    (count, workstream) => count + workstream.points.length,
    0
  );

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
    <article className={styles.dossier} aria-labelledby={headingId}>
      <header className={styles.employerLabel}>
        <div className={styles.employerLine}>
          <h3 id={headingId} className={styles.employerName}>
            {experience.company}
          </h3>
          <span className={styles.period}>{experience.period}</span>
        </div>
        <p className={styles.companyContext}>{experience.companyContext}</p>
      </header>

      <div className={styles.roleSummary}>
        <h4 className={styles.roleTitle}>{experience.roleTitle}</h4>
        <p className={styles.employmentNote}>{experience.employmentNote}</p>
        <p className={styles.roleScope}>{experience.roleScope}</p>
        <ul className={styles.pointList}>
          {experience.summaryPoints.map((point) => (
            <li key={`${point.lead}-${point.detail}`}>
              <ExperiencePointText point={point} />
            </li>
          ))}
        </ul>
      </div>

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
            {sectionCount} sections · {pointCount} points
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
                          <ExperiencePointText point={point} />
                        </li>
                      ))}
                    </ul>

                    {workstream.images?.length ? (
                      <div className={styles.toolkitFigureGrid}>
                        {workstream.images.map((image) => (
                          <figure className={styles.toolkitFigure} key={image.src}>
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
    </article>
  );
}

export default function ExperienceSection({
  experiences,
  tone,
}: ExperienceSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: prefersReducedMotion ? undefined : headerRef,
    offset: ["start 0.86", "start 0.50"],
  });

  if (experiences.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="experience" tone={tone} className={styles.experienceSection}>
      <div className={styles.experienceRoot}>
        <header ref={headerRef} className={styles.sectionHeader}>
          <div className={styles.titleCluster}>
            <h2 className={styles.heading}>
              <FlipRevealText
                static
                overprint
                text="Experience"
                mode="char"
                className={styles.headingFlip}
                tokenClassName={styles.headingFlipToken}
              />
            </h2>
            <RisoMark
              variant="arc"
              placement="inline"
              progress={scrollYProgress}
              className={styles.experienceArc}
            />
          </div>
          <p className={styles.callout}>
            MySQL backend work, database releases and internal tools.
          </p>
        </header>

        <div className={styles.dossierList}>
          {experiences.map((experience) => (
            <ExperienceDossier key={experience.slug} experience={experience} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
