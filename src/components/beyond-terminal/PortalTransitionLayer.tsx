"use client";

import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { PortalTransitionIntent, PortalTransitionPhase } from "@/types";
import styles from "./PortalTransitionLayer.module.css";

interface PortalTransitionLayerProps {
  intent: PortalTransitionIntent | null;
  phase: PortalTransitionPhase;
  reducedMotion: boolean;
  triggerMode: "pointer" | "keyboard" | null;
}

function getTransitionCopy(intent: PortalTransitionIntent) {
  const routeLabel = intent.source === "easter-egg" ? "Hidden route" : "Editorial route";

  if (intent.skin === "beyond-pastel-mist") {
    return {
      eyebrow: routeLabel,
      title: "Beyond The Terminal",
      description:
        "Opening the hidden photo wall: people, events, notes, and the color outside the main portfolio.",
    };
  }

  return {
    eyebrow: routeLabel,
    title: "Beyond The Terminal",
    description: "Crossing into the dedicated editorial side route.",
  };
}

export default function PortalTransitionLayer({
  intent,
  phase,
  reducedMotion,
  triggerMode,
}: PortalTransitionLayerProps) {
  if (!intent || phase === "idle") {
    return null;
  }

  const content = getTransitionCopy(intent);
  const originStyles = {
    ["--portal-origin-x" as string]: `${intent.originX}px`,
    ["--portal-origin-y" as string]: `${intent.originY}px`,
  } as CSSProperties;
  const cinematicEase = [0.22, 1, 0.36, 1] as const;
  const quickEase = [0.17, 0.67, 0.3, 1] as const;
  const isRevealing = phase === "revealing";
  const isAccessibleFade = intent.variant === "accessible-fade";
  const coverTransition = reducedMotion
    ? { duration: 0.18, ease: cinematicEase }
    : { duration: 0.5, ease: cinematicEase };
  const revealTransition = reducedMotion
    ? { duration: 0.18, ease: quickEase }
    : { duration: 0.62, ease: cinematicEase };

  return (
    <motion.div
      aria-hidden="true"
      data-portal-phase={phase}
      data-portal-variant={intent.variant}
      data-portal-skin={intent.skin}
      data-trigger-mode={triggerMode ?? "pointer"}
      className={cn(
        styles.root,
        isAccessibleFade && styles.rootReduced,
        isRevealing && styles.rootRevealing
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: isRevealing ? 0 : 1 }}
      transition={isRevealing ? revealTransition : coverTransition}
    >
      <div className={styles.canvas} style={originStyles}>
        <motion.div
          className={styles.cover}
          initial={{
            clipPath: isAccessibleFade
              ? "inset(0 0 0 0)"
              : `circle(0px at ${intent.originX}px ${intent.originY}px)`,
            opacity: isAccessibleFade ? 0 : 1,
          }}
          animate={{
            clipPath: isAccessibleFade
              ? "inset(0 0 0 0)"
              : `circle(150vmax at ${intent.originX}px ${intent.originY}px)`,
            opacity: isRevealing ? 0 : 1,
          }}
          transition={isRevealing ? revealTransition : coverTransition}
        />

        <motion.div
          className={styles.blur}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: isRevealing ? 0 : reducedMotion ? 0.14 : 0.44,
            scale: isRevealing ? 1.14 : 1,
          }}
          transition={isRevealing ? revealTransition : coverTransition}
        />

        <motion.div
          className={styles.frame}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{
            opacity: isRevealing ? 0 : 1,
            scale: isRevealing ? 1.02 : 1,
          }}
          transition={isRevealing ? revealTransition : coverTransition}
        />

        <motion.div
          className={styles.grain}
          initial={{ opacity: 0 }}
          animate={{ opacity: isRevealing ? 0 : 0.08 }}
          transition={isRevealing ? revealTransition : coverTransition}
        />

        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 24 }}
          animate={{
            opacity: isRevealing ? 0 : 1,
            y: isRevealing ? -18 : 0,
          }}
          transition={isRevealing ? revealTransition : { ...coverTransition, delay: 0.08 }}
        >
          <span className={styles.eyebrow}>{content.eyebrow}</span>
          <h2 className={styles.title}>{content.title}</h2>
          <p className={styles.description}>{content.description}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
