"use client";

import { useScroll } from "motion/react";
import { useRef } from "react";
import type { ChronicleEntry, ExperiencePoint, SectionTone } from "@/types";
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

function getKeyPoints(experience: ChronicleEntry): ExperiencePoint[] {
  const delivery = experience.workstreams.find(
    (workstream) => workstream.id === "database-delivery"
  );
  const aiTooling = experience.workstreams.find(
    (workstream) => workstream.id === "ai-tooling"
  );

  return [delivery?.points[0], delivery?.points[2], aiTooling?.points[0]].filter(
    (point): point is ExperiencePoint => Boolean(point)
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
            Where the business rules live and the releases ship.
          </p>
        </header>

        <div className={styles.dossierList}>
          {experiences.map((experience) => {
            const primaryRole = experience.roles[0];
            const keyPoints = getKeyPoints(experience);
            const employerHeadingId = `${experience.slug}-employer`;

            if (!primaryRole) {
              return null;
            }

            return (
              <article
                key={experience.slug}
                className={styles.dossier}
                aria-labelledby={employerHeadingId}
              >
                <header className={styles.employerLabel}>
                  <div className={styles.employerLine}>
                    <h3 id={employerHeadingId} className={styles.employerName}>
                      {experience.company}
                    </h3>
                    <span className={styles.period}>{experience.period}</span>
                  </div>
                  <p className={styles.companyContext}>{experience.companyContext}</p>
                </header>

                <div className={styles.roleSummary}>
                  <div className={styles.roleHeading}>
                    <h4 className={styles.roleTitle}>{primaryRole.title}</h4>
                    <p className={styles.roleDate}>{primaryRole.date}</p>
                  </div>
                  <ul className={styles.pointList}>
                    {keyPoints.map((point) => (
                      <li key={`${point.lead}-${point.detail}`}>
                        <strong>{point.lead}.</strong> {point.detail}
                      </li>
                    ))}
                  </ul>
                </div>

                <details className={styles.detailDisclosure}>
                  <summary>Selected engineering work</summary>
                  <div className={styles.detailContent}>
                    <p className={styles.backendThesis}>{experience.backendThesis}</p>
                    <p className={styles.functionality}>{experience.functionality}</p>

                    {experience.roles.length > 1 ? (
                      <div className={styles.roleHistory}>
                        <h4>Role progression</h4>
                        <ol>
                          {experience.roles.slice(1).map((role) => (
                            <li key={`${role.title}-${role.date}`}>
                              <strong>{role.title}</strong>
                              <span>{role.date}</span>
                              {role.note ? <p>{role.note}</p> : null}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : null}

                    <div className={styles.detailGrid}>
                      <div className={styles.ledgerPlate}>
                        <ChangeLedgerPlate id={experience.slug} />
                      </div>
                      <div className={styles.workstreamList}>
                        {experience.workstreams.map((workstream) => (
                          <section key={workstream.id} className={styles.workstream}>
                            <h4>{workstream.title}</h4>
                            <p>{workstream.summary}</p>
                            <ul>
                              {workstream.points.map((point) => (
                                <li key={`${point.lead}-${point.detail}`}>
                                  <strong>{point.lead}.</strong> {point.detail}
                                </li>
                              ))}
                            </ul>
                            <p className={styles.toolList}>
                              {workstream.tools.join(", ")}
                            </p>
                          </section>
                        ))}
                      </div>
                    </div>
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
