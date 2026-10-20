"use client";

import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { MouseEvent } from "react";
import type { ChronicleEntry, ExperiencePoint, SectionTone } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import RevealText from "@/components/motion/RevealText";
import styles from "./ExperienceSection.module.css";

interface ExperienceSectionProps {
  experiences: ChronicleEntry[];
  tone?: SectionTone;
}

function pointLead(point: ExperiencePoint): string {
  return point.emphasis
    ? `${point.lead} ${point.emphasis},`
    : `${point.lead}.`;
}

function targetId(experience: ChronicleEntry, workstreamId: string): string {
  return `${experience.slug}-workstream-${workstreamId}`;
}

interface ExperienceDossierProps {
  experience: ChronicleEntry;
}

function ExperienceDossier({ experience }: ExperienceDossierProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeWorkstreamId, setActiveWorkstreamId] = useState(
    experience.workstreams[0]?.id ?? ""
  );
  const [pendingTargetId, setPendingTargetId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const openFromHash = () => {
      const hash = window.location.hash.slice(1);
      const isWorkstreamTarget = experience.workstreams.some(
        (workstream) => targetId(experience, workstream.id) === hash
      );

      if (hash === panelId) {
        setIsExpanded(true);
      } else if (isWorkstreamTarget) {
        setPendingTargetId(hash);
        setIsExpanded(true);
      }
    };

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [experience, panelId]);

  useEffect(() => {
    if (!isExpanded) return;
    const panel = panelRef.current;
    if (!panel || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)[0];

        if (current instanceof IntersectionObserverEntry && current.target instanceof HTMLElement) {
          const id = current.target.dataset.workstream;
          if (id) setActiveWorkstreamId(id);
        }
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: 0 }
    );

    panel.querySelectorAll<HTMLElement>("[data-workstream]").forEach((workstream) => {
      observer.observe(workstream);
    });

    return () => observer.disconnect();
  }, [isExpanded]);

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

  function handleWorkstreamClick(
    event: MouseEvent<HTMLAnchorElement>,
    id: string
  ) {
    if (isExpanded) return;
    event.preventDefault();
    setPendingTargetId(id);
    setIsExpanded(true);
  }

  function handlePanelAnimationComplete() {
    if (!isExpanded) return;

    const hashTarget = window.location.hash.slice(1);
    const linkedTarget = experience.workstreams.some(
      (workstream) => targetId(experience, workstream.id) === hashTarget
    )
      ? hashTarget
      : null;
    const id = pendingTargetId ?? linkedTarget;
    if (!id) return;

    if (window.location.hash !== `#${id}`) {
      window.history.pushState(null, "", `#${id}`);
    }
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
    setPendingTargetId(null);
  }

  return (
    <article className={styles.experienceEntry} aria-labelledby={companyId}>
      <aside className={styles.experienceSidebar} aria-label="At work">
        <p className={styles.atWork}>At work</p>
        <h3 id={companyId} className={styles.employerName}>
          {experience.company}
        </h3>
        <p className={styles.roleTitle}>{experience.roleTitle}</p>
        <p className={styles.period}>{experience.period}</p>

        <nav className={styles.workstreamNav} aria-label={`Workstreams at ${experience.company}`}>
          <p className={styles.workstreamNavLabel}>Workstreams</p>
          <ul className={styles.workstreamNavList}>
            {experience.workstreams.map((workstream) => {
              const id = targetId(experience, workstream.id);
              const isActive = activeWorkstreamId === workstream.id;

              return (
                <li key={workstream.id}>
                  <a
                    href={`#${id}`}
                    aria-current={isActive ? "location" : undefined}
                    data-active={isActive}
                    onClick={(event) => handleWorkstreamClick(event, id)}
                  >
                    {workstream.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className={styles.experienceContent} data-experience-content="true">
        <p className={styles.employmentNote}>{experience.employmentNote}</p>
        <p className={styles.roleScope}>{experience.roleScope}</p>

        <ul className={styles.pointList} aria-label="Role summary">
          {experience.summaryPoints.map((point) => (
            <li className={styles.summaryPoint} key={`${point.lead}-${point.detail}`}>
              <p className={styles.summarySentence}>
                <strong>{pointLead(point)}</strong> {point.detail}
              </p>
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
            ref={panelRef}
            id={panelId}
            className={styles.detailPanel}
            role="region"
            aria-labelledby={toggleId}
            aria-hidden={!isExpanded}
            inert={!isExpanded}
            initial={false}
            animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
            transition={panelTransition}
            onAnimationComplete={handlePanelAnimationComplete}
          >
            <div className={styles.detailContent}>
              <div className={styles.workstreamGrid}>
                {experience.workstreams.map((workstream) => {
                  const headingId = `${targetId(experience, workstream.id)}-title`;

                  return (
                    <section
                      key={workstream.id}
                      id={targetId(experience, workstream.id)}
                      className={styles.workstream}
                      data-workstream={workstream.id}
                      aria-labelledby={headingId}
                    >
                      <h4 id={headingId}>{workstream.title}</h4>
                      <p className={styles.workstreamSummary}>{workstream.summary}</p>
                      <ul className={styles.workstreamPoints}>
                        {workstream.points.map((point) => (
                          <li key={`${point.lead}-${point.detail}`}>
                            <strong>{pointLead(point)}</strong> {point.detail}
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
                                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 30vw, 360px"
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
                    </section>
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
  if (experiences.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="experience" tone={tone} className={styles.experienceSection}>
      <div className={styles.experienceRoot}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.heading}>
            <RevealText text="Experience" as="span" className={styles.headingReveal} />
          </h2>
        </header>

        <div className={styles.experienceList}>
          {experiences.map((experience) => (
            <ExperienceDossier key={experience.slug} experience={experience} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
