"use client";

import { useScroll } from "motion/react";
import { useRef } from "react";
import type { ChronicleEntry, SectionTone } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import RisoMark from "@/components/ui/RisoMark";
import FlipRevealText from "@/components/ui/FlipRevealText";
import ChangeLedgerPlate from "@/components/art/ChangeLedgerPlate";
import styles from "./ExperienceSection.module.css";

interface ExperienceSectionProps {
  experiences: ChronicleEntry[];
  tone?: SectionTone;
}

function OpeningSentence({ text }: { text: string }) {
  const sentenceEnd = text.indexOf(".");

  if (sentenceEnd < 0) {
    return <strong>{text}</strong>;
  }

  return (
    <>
      <strong>{text.slice(0, sentenceEnd + 1)}</strong>
      {text.slice(sentenceEnd + 1)}
    </>
  );
}

export default function ExperienceSection({
  experiences,
  tone,
}: ExperienceSectionProps) {
  if (experiences.length === 0) {
    return null;
  }

  return <ExperienceSectionContent experiences={experiences} tone={tone} />;
}

function ExperienceSectionContent({
  experiences,
  tone,
}: ExperienceSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  // The section mark still draws with its header's transit; the copy itself is
  // static, so the arc is the one motion moment on this screen.
  const headerRef = useRef<HTMLElement>(null);
  const { scrollYProgress: headerProgress } = useScroll({
    target: prefersReducedMotion ? undefined : headerRef,
    offset: ["start 0.86", "start 0.50"],
  });

  return (
    <SectionWrapper id="experience" tone={tone} className={styles.experienceSection}>
      <div className={styles.experienceRoot}>
        <header
          ref={headerRef}
          className={styles.sectionHeader}
          data-experience-header="true"
        >
          <div className={styles.titleCluster}>
            <h2
              id="experience-title"
              className={styles.heading}
              data-experience-title="true"
            >
              <FlipRevealText
                static
                overprint
                text="Experience"
                mode="char"
                className={styles.headingFlip}
                tokenClassName={styles.headingFlipToken}
              />
            </h2>
            <span className={styles.arcAnchor} data-experience-arc="true">
              <RisoMark
                variant="arc"
                placement="inline"
                progress={headerProgress}
                className={styles.experienceArc}
              />
            </span>
          </div>

          <p className={styles.callout}>
            Where the business rules live and the releases ship.
          </p>
        </header>

        <div className={styles.dossierList}>
          {experiences.map((experience) => {
            const employerHeadingId = `${experience.slug}-employer`;
            const rolesHeadingId = `${experience.slug}-roles`;
            const workHeadingId = `${experience.slug}-work`;

            return (
              <article
                key={experience.slug}
                className={styles.dossier}
                aria-labelledby={employerHeadingId}
                data-experience-dossier={experience.slug}
              >
                <header className={styles.employerLabel}>
                  <div className={styles.employerLine}>
                    <h3 id={employerHeadingId} className={styles.employerName}>
                      {experience.company}
                      <span className={styles.employerDivision}>· Airport Assistance</span>
                    </h3>
                    <span className={styles.period}>{experience.period}</span>
                  </div>
                  <p className={styles.companyContext}>{experience.companyContext}</p>
                </header>

                <div className={styles.narrativeDeck}>
                  <p className={styles.backendThesis}>
                    <OpeningSentence text={experience.backendThesis} />
                  </p>
                  <p className={styles.functionality}>
                    <strong className={styles.functionalityLead}>
                      Functionality breadth
                    </strong>
                    <span>{experience.functionality}</span>
                  </p>
                </div>

                <div className={styles.dossierBody}>
                  <section
                    className={styles.roleRail}
                    aria-labelledby={rolesHeadingId}
                    data-experience-role-rail="true"
                  >
                    <div className={styles.roleRailContent}>
                    <h4 id={rolesHeadingId} className={styles.columnLabel}>
                      Role progression
                    </h4>
                    <ol className={styles.roleList}>
                      {experience.roles.map((role) => (
                        <li key={`${role.title}-${role.date}`} className={styles.roleItem}>
                          <span className={styles.roleMarker} aria-hidden="true" />
                          <div>
                            <h5 className={styles.roleTitle}>{role.title}</h5>
                            <p className={styles.roleDate}>{role.date}</p>
                            {role.note ? <p className={styles.roleNote}>{role.note}</p> : null}
                          </div>
                        </li>
                      ))}
                    </ol>
                    <ChangeLedgerPlate id={experience.slug} />
                    </div>
                  </section>

                  <section
                    className={styles.engineeringWork}
                    aria-labelledby={workHeadingId}
                    data-experience-workstreams="true"
                  >
                    <h4 id={workHeadingId} className={styles.columnLabel}>
                      Selected engineering work
                    </h4>
                    <div className={styles.workstreamList}>
                      {experience.workstreams.map((workstream) => (
                        <article
                          key={workstream.id}
                          className={styles.workstream}
                          data-experience-workstream={workstream.id}
                        >
                          <div className={styles.workstreamHeader}>
                            <h5 className={styles.workstreamTitle}>{workstream.title}</h5>
                            <p className={styles.workstreamSummary}>{workstream.summary}</p>
                          </div>

                          <ul className={styles.pointList}>
                            {workstream.points.map((point) => (
                              <li key={`${workstream.id}-${point.lead}`}>
                                <span>
                                  <strong>{point.lead}.</strong> {point.detail}
                                </span>
                              </li>
                            ))}
                          </ul>

                          <ul
                            className={styles.toolList}
                            aria-label={`${workstream.title} tools and practices`}
                          >
                            {workstream.tools.map((tool) => (
                              <li key={tool}>{tool}</li>
                            ))}
                          </ul>
                        </article>
                      ))}
                    </div>
                  </section>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
