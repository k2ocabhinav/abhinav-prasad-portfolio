"use client";

import * as m from "motion/react-m";
import { useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import type { OrchestrationContent } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "../WorksSection.module.css";

interface WorkMethodProps {
  content: OrchestrationContent;
}

const parallelPath = {
  top: "M250 100 C310 100 300 42 365 42 H645 C710 42 710 100 760 100",
  middle: "M250 100 H760",
  bottom: "M250 100 C310 100 300 158 365 158 H645 C710 158 710 100 760 100",
};
const stationProgress = [0, 0.16, 0.68, 0.94] as const;

export default function WorkMethod({ content }: WorkMethodProps) {
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
  const scopeProgress = useTransform(progress, [0, 0.22], [0, 1]);
  const laneProgress = useTransform(progress, [0.22, 0.68], [0, 1]);
  const verifyProgress = useTransform(progress, [0.68, 1], [0, 1]);
  const activeRoute = prefersReducedMotion ? 1 : undefined;
  const topX = useTransform(laneProgress, [0, 0.2, 0.78, 1], [250, 365, 645, 760]);
  const middleX = useTransform(laneProgress, [0, 1], [250, 760]);
  const bottomX = useTransform(laneProgress, [0, 0.2, 0.78, 1], [250, 365, 645, 760]);
  const topY = useTransform(laneProgress, [0, 0.2, 0.78, 1], [100, 42, 42, 100]);
  const bottomY = useTransform(laneProgress, [0, 0.2, 0.78, 1], [100, 158, 158, 100]);
  const dotOpacity = useTransform(laneProgress, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);

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
            viewBox="0 0 1200 200"
            preserveAspectRatio="none"
            role="img"
            aria-label="Scope leads to Assign, splits into three parallel lanes, converges for Review, and continues to Verify."
          >
            <path className={styles.routeBase} d="M40 100 H250" />
            <path className={styles.routeBase} d={parallelPath.top} />
            <path className={styles.routeBase} d={parallelPath.middle} />
            <path className={styles.routeBase} d={parallelPath.bottom} />
            <path className={styles.routeBase} d="M760 100 C850 100 960 100 1160 100" />
            <m.path
              className={styles.routeScope}
              d="M40 100 H250"
              pathLength={1}
              style={{ pathLength: activeRoute ?? scopeProgress }}
            />
            <m.path
              className={styles.routeTop}
              d={parallelPath.top}
              pathLength={1}
              style={{ pathLength: activeRoute ?? laneProgress }}
            />
            <m.path
              className={styles.routeMiddle}
              d={parallelPath.middle}
              pathLength={1}
              style={{ pathLength: activeRoute ?? laneProgress }}
            />
            <m.path
              className={styles.routeBottom}
              d={parallelPath.bottom}
              pathLength={1}
              style={{ pathLength: activeRoute ?? laneProgress }}
            />
            <m.path
              className={styles.routeVerify}
              d="M760 100 C850 100 960 100 1160 100"
              pathLength={1}
              style={{ pathLength: activeRoute ?? verifyProgress }}
            />
            <circle className={styles.stationAnchor} cx="40" cy="100" r="5" />
            <circle className={styles.stationAnchor} cx="250" cy="100" r="5" />
            <circle className={styles.stationAnchor} cx="760" cy="100" r="5" />
            <circle className={styles.stationAnchor} cx="1160" cy="100" r="5" />
            <m.circle
              className={styles.agentDotTop}
              r="4"
              style={{ cx: prefersReducedMotion ? 507 : topX, cy: prefersReducedMotion ? 42 : topY, opacity: prefersReducedMotion ? 1 : dotOpacity }}
            />
            <m.circle
              className={styles.agentDotMiddle}
              r="4"
              style={{ cx: prefersReducedMotion ? 507 : middleX, cy: 100, opacity: prefersReducedMotion ? 1 : dotOpacity }}
            />
            <m.circle
              className={styles.agentDotBottom}
              r="4"
              style={{ cx: prefersReducedMotion ? 507 : bottomX, cy: prefersReducedMotion ? 158 : bottomY, opacity: prefersReducedMotion ? 1 : dotOpacity }}
            />
          </svg>

          <svg
            className={styles.mobileRoute}
            viewBox="0 0 60 620"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className={styles.routeBase} d="M30 10 V160" />
            <path className={styles.routeBase} d="M30 160 C30 196 10 190 10 230 V360 C10 390 30 390 30 420" />
            <path className={styles.routeBase} d="M30 160 V420" />
            <path className={styles.routeBase} d="M30 160 C30 196 50 190 50 230 V360 C50 390 30 390 30 420" />
            <path className={styles.routeBase} d="M30 420 V610" />
            <m.path
              className={styles.routeScope}
              d="M30 10 V160"
              pathLength={1}
              style={{ pathLength: activeRoute ?? scopeProgress }}
            />
            <m.path
              className={styles.routeTop}
              d="M30 160 C30 196 10 190 10 230 V360 C10 390 30 390 30 420"
              pathLength={1}
              style={{ pathLength: activeRoute ?? laneProgress }}
            />
            <m.path
              className={styles.routeMiddle}
              d="M30 160 V420"
              pathLength={1}
              style={{ pathLength: activeRoute ?? laneProgress }}
            />
            <m.path
              className={styles.routeBottom}
              d="M30 160 C30 196 50 190 50 230 V360 C50 390 30 390 30 420"
              pathLength={1}
              style={{ pathLength: activeRoute ?? laneProgress }}
            />
            <m.path
              className={styles.routeVerify}
              d="M30 420 V610"
              pathLength={1}
              style={{ pathLength: activeRoute ?? verifyProgress }}
            />
          </svg>

          <ol className={styles.processSteps}>
            {content.steps.map((step, index) => {
              return (
                <MethodStep
                  key={step.title}
                  step={step}
                  index={index}
                  progress={progress}
                  prefersReducedMotion={prefersReducedMotion}
                />
              );
            })}
          </ol>
        </div>

        <p className={styles.methodCaption}>
          Independent work returns to one human review.
        </p>
      </div>
    </aside>
  );
}

function MethodStep({
  step,
  index,
  progress,
  prefersReducedMotion,
}: {
  step: OrchestrationContent["steps"][number];
  index: number;
  progress: MotionValue<number>;
  prefersReducedMotion: boolean;
}) {
  const stepProgress = stationProgress[index] ?? 1;
  const revealOpacity = useTransform(
    progress,
    [Math.max(0, stepProgress - 0.12), stepProgress],
    [0.42, 1]
  );
  const revealY = useTransform(
    progress,
    [Math.max(0, stepProgress - 0.12), stepProgress],
    [12, 0]
  );

  return (
    <m.li
      style={{
        opacity: prefersReducedMotion ? 1 : revealOpacity,
        y: prefersReducedMotion ? 0 : revealY,
      }}
    >
      <span className={styles.stationRule} aria-hidden="true" />
      <h4>{step.title}</h4>
      <p>{step.description}</p>
    </m.li>
  );
}
