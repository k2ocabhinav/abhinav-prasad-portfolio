"use client";

import Image from "next/image";
import Link from "next/link";
import * as m from "motion/react-m";
import { useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { tiltSpring } from "@/lib/animations";
import { renderIcon } from "@/lib/utils";
import ClipReveal from "@/components/motion/ClipReveal";
import RevealText from "@/components/motion/RevealText";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Project } from "@/types";
import styles from "../WorksSection.module.css";

interface WorkReelProps {
  projects: Project[];
}

const portfolioImage = {
  src: "/projects/portfolio-platform/home-first-desktop.webp",
  alt: "Portfolio home hero at 1440 pixels wide, with Abhinav's wordmark, introduction, and proof rows",
};

export default function WorkReel({ projects }: WorkReelProps) {
  return (
    <div className={styles.projectsList}>
      {projects.map((project, index) => (
        <div className={styles.projectGroup} key={project.id}>
          {index > 0 ? <ProjectRule /> : null}
          <ProjectSequence project={project} index={index} />
        </div>
      ))}
    </div>
  );
}

function ProjectSequence({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const trackRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 22,
    mass: 0.6,
  });
  const scale = useTransform(progress, [0, 0.82, 1], [0.62, 0.98, 1]);
  const clipPath = useTransform(
    progress,
    [0, 0.82, 1],
    ["inset(1.5% 3.5% round 2px)", "inset(0 round 1px)", "inset(0 round 0px)"]
  );
  const titleY = useTransform(progress, [0, 0.24], [18, 0]);
  const caseY = useTransform(progress, [0, 0.2], [14, 0]);
  const finalCaseNumber = Number(project.id);
  const [visibleCaseNumber, setVisibleCaseNumber] = useState(finalCaseNumber);
  const displayedCaseNumber = useRef(finalCaseNumber);
  const caseCount = useTransform(progress, [0, 0.2], [0, finalCaseNumber]);

  useMotionValueEvent(caseCount, "change", (value) => {
    if (prefersReducedMotion) return;
    const next = Math.min(finalCaseNumber, Math.floor(value));
    if (displayedCaseNumber.current === next) return;
    displayedCaseNumber.current = next;
    setVisibleCaseNumber(next);
  });

  const isPortfolio = project.detailSlug === "portfolio-platform";
  const heroScreenshot = isPortfolio
    ? portfolioImage
    : project.screenshots?.[0];
  const title = project.detailSlug === "velo" ? "Velo" : project.title;
  const caseNumber = String(visibleCaseNumber).padStart(2, "0");
  const sourceLink = project.links?.find((link) => link.href);
  const eyebrow = isPortfolio ? "Portfolio platform" : "Velo / Dispatch Atlas";

  return (
    <article
      ref={trackRef}
      className={styles.projectTrack}
      aria-labelledby={`work-project-${project.detailSlug ?? project.id}`}
      data-work-project={project.detailSlug ?? project.id}
    >
      <div className={styles.projectStage}>
        <div className={styles.projectHeading}>
          <m.span className={styles.caseNumber} style={{ y: caseY }}>
            {caseNumber}
          </m.span>
          <h3
            className={`${styles.projectTitle} ${isPortfolio ? styles.projectTitleLong : ""}`}
            id={`work-project-${project.detailSlug ?? project.id}`}
          >
            <m.span style={{ y: titleY }}>
              <RevealText text={title} />
            </m.span>
          </h3>
        </div>

        <ClipReveal className={styles.mobileClip} from="bottom">
          <div className={styles.imageRevealInner}>
            <m.figure
              className={styles.projectFrame}
              data-work-frame="true"
              style={{
                scale: prefersReducedMotion ? 1 : scale,
                clipPath: prefersReducedMotion ? "inset(0)" : clipPath,
              }}
            >
              {heroScreenshot ? (
                <Image
                  src={heroScreenshot.src}
                  alt={heroScreenshot.alt}
                  fill
                  sizes="(max-width: 1023px) 100vw, 92vw"
                  className={styles.projectImage}
                  priority={index === 0}
                />
              ) : (
                <div className={styles.projectFallback} aria-hidden="true">
                  {renderIcon(project.icon, { size: 72 })}
                </div>
              )}
            </m.figure>
          </div>
        </ClipReveal>

        <div className={styles.detailsBand} data-work-copy="true">
          <div className={styles.projectSummary}>
            <p className={styles.projectEyebrow}>{eyebrow}</p>
            <p className={styles.projectDescription}>{project.description}</p>
          </div>

          {project.tags.length > 0 ? (
            <ul className={styles.projectTags} aria-label={`${title} technologies`}>
              {project.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}

          <div className={styles.projectActions}>
            {project.detailSlug ? (
              <Link
                href={`/work/${project.detailSlug}`}
                className={styles.caseStudyButton}
              >
                <m.span whileHover={{ y: -1 }} transition={tiltSpring}>
                  Read the case study
                </m.span>
              </Link>
            ) : null}
            {sourceLink?.href ? (
              <a
                href={sourceLink.href}
                target="_blank"
                rel="noreferrer"
                className={styles.sourceLink}
              >
                View project source
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectRule() {
  return (
    <ClipReveal className={styles.projectRuleReveal} from="left">
      <hr className={styles.projectRule} />
    </ClipReveal>
  );
}
