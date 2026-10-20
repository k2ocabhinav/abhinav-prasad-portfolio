"use client";

import Image from "next/image";
import Link from "next/link";
import * as m from "motion/react-m";
import { useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import ClipReveal from "@/components/motion/ClipReveal";
import { tiltSpring } from "@/lib/animations";
import { renderIcon } from "@/lib/utils";
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
      {projects.map((project, index) => {
        const isPortfolio = project.detailSlug === "portfolio-platform";

        return (
          <div className={styles.projectGroup} key={project.id}>
            {index > 0 ? <ProjectRule /> : null}
            {isPortfolio ? (
              <PortfolioCard project={project} />
            ) : (
              <VeloFeature project={project} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function VeloFeature({ project }: { project: Project }) {
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
  const scale = useTransform(progress, [0, 0.82, 1], [0.72, 0.98, 1]);
  const screenshot = project.screenshots?.[0];
  const sourceLink = project.links?.find((link) => link.href);

  return (
    <article
      ref={trackRef}
      className={`${styles.projectTrack} ${styles.veloTrack}`}
      aria-labelledby="work-project-velo"
      data-work-project="velo"
      data-project-kind="velo"
    >
      <div className={styles.projectStage}>
        <header className={styles.projectHeading}>
          <span className={styles.caseNumber} aria-hidden="true">01</span>
          <h3 className={styles.projectTitle} id="work-project-velo">Velo</h3>
        </header>

        <div className={styles.featureLayout}>
          <ClipReveal className={styles.projectImageReveal} from="bottom">
            <m.figure
              className={styles.projectFrame}
              data-work-frame="true"
              style={{ scale: prefersReducedMotion ? 1 : scale }}
            >
              {screenshot ? (
                <Image
                  src={screenshot.src}
                  alt={screenshot.alt}
                  fill
                  sizes="(min-width: 1024px) 64vw, 100vw"
                  className={styles.projectImage}
                />
              ) : (
                <div className={styles.projectFallback} aria-hidden="true">
                  {renderIcon(project.icon, { size: 72 })}
                </div>
              )}
            </m.figure>
          </ClipReveal>

          <ProjectDetails
            project={project}
            title="Velo"
            eyebrow="Velo / Dispatch Atlas"
            sourceLink={sourceLink?.href ? sourceLink : undefined}
            className={styles.featureDetails}
          />
        </div>
      </div>
    </article>
  );
}

function PortfolioCard({ project }: { project: Project }) {
  const screenshot = portfolioImage;

  return (
    <article
      className={`${styles.projectTrack} ${styles.portfolioTrack}`}
      aria-labelledby="work-project-portfolio-platform"
      data-work-project="portfolio-platform"
      data-project-kind="portfolio"
    >
      <div className={styles.portfolioCard}>
        <header className={styles.projectHeading}>
          <span className={styles.caseNumber} aria-hidden="true">02</span>
          <h3
            className={`${styles.projectTitle} ${styles.projectTitleLong}`}
            id="work-project-portfolio-platform"
          >
            Portfolio publishing system
          </h3>
        </header>

        <div className={styles.featureLayout}>
          <ClipReveal className={styles.projectImageReveal} from="bottom">
            <figure className={styles.projectFrame} data-work-frame="true">
              <Image
                src={screenshot.src}
                alt={screenshot.alt}
                fill
                sizes="(min-width: 1024px) 64vw, 100vw"
                className={styles.projectImage}
              />
            </figure>
          </ClipReveal>

          <ProjectDetails
            project={project}
            title="Portfolio publishing system"
            eyebrow="Portfolio platform"
            className={styles.portfolioDetails}
          />
        </div>
      </div>
    </article>
  );
}

function ProjectDetails({
  project,
  title,
  eyebrow,
  sourceLink,
  className,
}: {
  project: Project;
  title: string;
  eyebrow: string;
  sourceLink?: NonNullable<Project["links"]>[number];
  className: string;
}) {
  return (
    <div className={`${styles.detailsBand} ${className}`} data-work-copy="true">
      <div className={styles.projectSummary}>
        <p className={styles.projectEyebrow}>{eyebrow}</p>
        <p className={styles.projectDescription}>{project.description}</p>
      </div>

      {project.tags.length > 0 ? (
        <ul className={styles.projectTags} aria-label={`${title} technologies`}>
          {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
      ) : null}

      <div className={styles.projectActions}>
        {project.detailSlug ? (
          <Link href={`/work/${project.detailSlug}`} prefetch={false} className={styles.caseStudyButton}>
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
  );
}

function ProjectRule() {
  return (
    <ClipReveal className={styles.projectRuleReveal} from="left">
      <hr className={styles.projectRule} />
    </ClipReveal>
  );
}
