"use client";

import { motion, useScroll, useTransform } from "motion/react";
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
  const headerRef = useRef<HTMLElement>(null);
  const { scrollYProgress: headerProgress } = useScroll({
    target: prefersReducedMotion ? undefined : headerRef,
    offset: ["start 0.86", "start 0.50"],
  });
  const clusterY = useTransform(headerProgress, [0, 0.7], [12, 0]);
  const deckOpacity = useTransform(headerProgress, [0.3, 0.7], [0, 1]);
  const deckY = useTransform(headerProgress, [0.3, 0.7], [10, 0]);

  return (
    <SectionWrapper id="experience" tone={tone} className={styles.experienceSection}>
      <div className={styles.experienceRoot}>
        <header
          ref={headerRef}
          className={styles.sectionHeader}
          data-experience-header="true"
        >
          <motion.div
            className={styles.titleCluster}
            style={{ y: prefersReducedMotion ? 0 : clusterY }}
          >
            <h2
              id="experience-title"
              className={styles.heading}
              data-experience-title="true"
            >
              <FlipRevealText
                flat
                overprint
                persist
                text="Experience"
                mode="char"
                progress={headerProgress}
                window={[0.12, 0.48]}
                stagger={0.028}
                perspective={910}
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
          </motion.div>

          <motion.p
            className={styles.callout}
            style={
              prefersReducedMotion
                ? undefined
                : { opacity: deckOpacity, y: deckY }
            }
          >
            Where the business rules live and the releases ship.
          </motion.p>
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
                  <p className={styles.eyebrow}>Professional experience</p>
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
                  <motion.p
                    className={styles.backendThesis}
                    initial={{ opacity: 0, y: 10 }}
                    animate={prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <OpeningSentence text={experience.backendThesis} />
                  </motion.p>
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
                      {experience.workstreams.map((workstream, index) => (
                        <motion.article
                          key={workstream.id}
                          className={styles.workstream}
                          data-experience-workstream={workstream.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
                          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.12 }}
                          transition={{
                            duration: prefersReducedMotion ? 0 : 0.45,
                            delay: prefersReducedMotion ? 0 : index * 0.08,
                            ease: [0.22, 1, 0.36, 1],
                          }}
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
                        </motion.article>
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
