"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ProjectStoryVisual, ProjectTripStep } from "@/types";
import styles from "./DispatchReel.module.css";

interface DispatchReelProps {
  steps: ProjectTripStep[];
  visuals: ProjectStoryVisual[];
}

export default function DispatchReel({ steps, visuals }: DispatchReelProps) {
  const reducedMotion = useReducedMotion();
  const [activeVisualId, setActiveVisualId] = useState(steps[0]?.visualId ?? "");
  const stepElements = useRef<Array<HTMLElement | null>>([]);
  const visualById = new Map(visuals.map((visual) => [visual.id, visual]));
  const activeVisual = visualById.get(activeVisualId) ?? visuals[0];

  useEffect(() => {
    if (reducedMotion || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const selected = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const visualId = selected?.target.getAttribute("data-visual-id");
        if (visualId) setActiveVisualId(visualId);
      },
      { rootMargin: "-38% 0px -48% 0px", threshold: 0 },
    );

    stepElements.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [reducedMotion, steps]);

  return (
    <div className={styles.reel} data-reduced-motion={reducedMotion} data-active-visual={activeVisual?.id}>
      <div className={styles.stage}>
        {activeVisual ? (
          <figure className={styles.stickyFrame}>
            <div className={styles.imageFrame}>
              <Image
                key={activeVisual.id}
                src={activeVisual.src}
                alt={activeVisual.alt}
                fill
                sizes="(max-width: 767px) 100vw, (max-width: 1100px) 48vw, 560px"
                className={styles.image}
              />
            </div>
            <figcaption className={styles.caption}>{activeVisual.caption}</figcaption>
          </figure>
        ) : null}
      </div>

      <ol className={styles.steps}>
        {steps.map((step, index) => {
          const visual = visualById.get(step.visualId);
          return (
            <li
              key={step.role}
              ref={(element) => {
                stepElements.current[index] = element;
              }}
              data-visual-id={step.visualId}
              className={styles.step}
            >
              <p className={styles.stepRole}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step.role}
              </p>
              <h3 className={styles.stepTitle}>{step.label}</h3>
              <p className={styles.stepSummary}>{step.summary}</p>
              {visual ? (
                <figure className={styles.mobileFrame}>
                  <div className={styles.imageFrame}>
                    <Image
                      src={visual.src}
                      alt={visual.alt}
                      fill
                      sizes="(max-width: 767px) 100vw, 560px"
                      className={styles.image}
                    />
                  </div>
                  <figcaption className={styles.caption}>{visual.caption}</figcaption>
                </figure>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
