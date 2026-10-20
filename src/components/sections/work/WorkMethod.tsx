"use client";

import * as m from "motion/react-m";
import { useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import ClipReveal from "@/components/motion/ClipReveal";
import type { OrchestrationContent } from "@/types";
import styles from "../WorksSection.module.css";

interface WorkMethodProps {
  content: OrchestrationContent;
}

const lanePaths = [
  "M250 100 C300 100 300 46 365 46 H565 C615 46 615 100 650 100",
  "M250 100 H650",
  "M250 100 C300 100 300 154 365 154 H565 C615 154 615 100 650 100",
] as const;

export default function WorkMethod({ content }: WorkMethodProps) {
  const trackRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 22,
    mass: 0.6,
  });
  const pathWipe = useTransform(progress, [0, 1], ["inset(0 100% 0 0)", "inset(0)"]);

  return (
    <aside
      ref={trackRef}
      className={styles.methodSequence}
      aria-labelledby="work-method-title"
      data-work-method="true"
    >
      <div className={styles.methodStage} data-work-method-stage="true">
        <header className={styles.methodHeader}>
          <h3 id="work-method-title">How I work</h3>
        </header>

        <div className={styles.methodCanvas}>
          <svg
            className={styles.desktopRoute}
            viewBox="0 0 1000 200"
            preserveAspectRatio="none"
            role="img"
            aria-label="Scope leads to Assign, splits into three parallel lanes, converges for Review, and continues to Verify."
          >
            <path className={styles.routeBase} d="M30 100 H250" />
            {lanePaths.map((path) => <path className={styles.routeBase} d={path} key={path} />)}
            <path className={styles.routeBase} d="M650 100 H840" />
            <m.g className={styles.routeAccent} style={{ clipPath: pathWipe }}>
              <path className={styles.routeScope} d="M30 100 H250" />
              <path className={styles.routeTop} d={lanePaths[0]} />
              <path className={styles.routeMiddle} d={lanePaths[1]} />
              <path className={styles.routeBottom} d={lanePaths[2]} />
              <path className={styles.routeVerify} d="M650 100 H840" />
            </m.g>
            <circle className={styles.stationAnchor} cx="30" cy="100" r="5" />
            <circle className={styles.stationAnchor} cx="250" cy="100" r="5" />
            <circle className={styles.stationAnchor} cx="650" cy="100" r="5" />
            <circle className={styles.stationAnchor} cx="840" cy="100" r="5" />
          </svg>

          <ClipReveal className={styles.mobileRouteReveal} from="bottom">
            <svg
              className={styles.mobileRoute}
              viewBox="0 0 80 620"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path className={styles.routeMobileScope} d="M40 10 V150" />
              <path className={styles.routeMobileLane} d="M40 150 C40 190 10 185 10 225 V345 C10 380 40 380 40 420" />
              <path className={styles.routeMobileLane} d="M40 150 V420" />
              <path className={styles.routeMobileLane} d="M40 150 C40 190 70 185 70 225 V345 C70 380 40 380 40 420" />
              <path className={styles.routeMobileVerify} d="M40 420 V610" />
            </svg>
          </ClipReveal>

          <ol className={styles.processSteps}>
            {content.steps.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stationRule} aria-hidden="true" />
                <h4>
                  <span className={styles.stationNumber}>{index + 1}</span>
                  {" "}
                  <span>{step.title}</span>
                </h4>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>

        <p className={styles.methodCaption}>
          Independent work returns to one human review.
        </p>
      </div>
    </aside>
  );
}
