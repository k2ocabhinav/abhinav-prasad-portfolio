"use client";

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { THEMES, activeThemeId } from "@/data/themes";
import type { ArtifactDef } from "@/types";
import Artifact from "./Artifact";
import styles from "./FloatingArtifacts.module.css";

type IdleWindow = Window & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ) => number;
};

const REPULSION_RADIUS = 180;

function hashSeed(seed: string): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export default function FloatingArtifacts() {
  const activeTheme = THEMES.find((theme) => theme.id === activeThemeId);
  const [ambientVisible, setAmbientVisible] = useState(false);
  const visibleArtifacts = useMemo(
    () =>
      (activeTheme?.artifacts ?? []).filter(
        (artifact) => ambientVisible || artifact.priority === "hero"
      ),
    [activeTheme, ambientVisible]
  );
  const visibleArtifactsRef = useRef<ArtifactDef[]>(visibleArtifacts);
  const stageRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    visibleArtifactsRef.current = visibleArtifacts;
  }, [visibleArtifacts]);

  useEffect(() => {
    const idleWindow = window as IdleWindow;
    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const showAmbient = () => {
      startTransition(() => {
        setAmbientVisible(true);
      });
    };

    if (typeof idleWindow.requestIdleCallback === "function") {
      idleId = idleWindow.requestIdleCallback(() => showAmbient(), { timeout: 850 });
    } else {
      timeoutId = window.setTimeout(() => showAmbient(), 260);
    }

    return () => {
      if (idleId !== null && typeof idleWindow.cancelIdleCallback === "function") {
        idleWindow.cancelIdleCallback(idleId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (visibleArtifactsRef.current.length === 0) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mouse = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.25,
    };
    const targetMouse = { ...mouse };
    let animationFrameId = 0;

    const updateTransforms = (time: number) => {
      mouse.x += (targetMouse.x - mouse.x) * 0.12;
      mouse.y += (targetMouse.y - mouse.y) * 0.12;

      const root = document.documentElement;
      const frozenForTests = root.dataset.e2eFreezeArtifacts === "true";
      const scrollableHeight = Math.max(1, root.scrollHeight - window.innerHeight);
      const scrollProgress = window.scrollY / scrollableHeight;
      const reducedMotion = prefersReducedMotion.matches;

      for (const artifact of visibleArtifactsRef.current) {
        const node = stageRefs.current.get(artifact.id);

        if (!node) {
          continue;
        }

        if (reducedMotion) {
          node.style.transform = "none";
          continue;
        }

        const seed = hashSeed(artifact.id);
        const phase = (seed % 360) * (Math.PI / 180);
        const timeSeconds = (frozenForTests ? 0 : time) / 1000;
        const driftAmplitude = artifact.driftAmplitude ?? 10;
        const driftX =
          Math.sin(timeSeconds * (0.34 + (seed % 7) * 0.02) + phase) *
          driftAmplitude *
          0.4;
        const driftY =
          Math.cos(timeSeconds * (0.48 + (seed % 5) * 0.025) + phase) *
          driftAmplitude;
        const sway =
          (artifact.swayAmplitude ?? 0) *
          Math.sin(timeSeconds * (0.28 + (seed % 3) * 0.015) + phase);
        const orbitRadius = artifact.orbitRadius ?? 0;
        const orbitDuration = artifact.orbitDuration ?? 18;
        const orbitX =
          orbitRadius > 0
            ? Math.cos((timeSeconds / orbitDuration) * Math.PI * 2 + phase) * orbitRadius
            : 0;
        const orbitY =
          orbitRadius > 0
            ? Math.sin((timeSeconds / orbitDuration) * Math.PI * 2 + phase) *
              orbitRadius *
              0.62
            : 0;
        const parallax =
          ((scrollProgress - 0.18) * 2 - 0.4) * (artifact.parallaxDepth ?? 20);
        const centerX = (artifact.x / 100) * window.innerWidth;
        const centerY = (artifact.y / 100) * window.innerHeight;
        const dx = centerX - mouse.x;
        const dy = centerY - mouse.y;
        const distance = Math.hypot(dx, dy);
        let repulsionX = 0;
        let repulsionY = 0;

        if (!reducedMotion && distance > 0 && distance < REPULSION_RADIUS) {
          const strength =
            (1 - distance / REPULSION_RADIUS) * (artifact.driftAmplitude ?? 10) * 1.1;

          repulsionX = (dx / distance) * strength;
          repulsionY = (dy / distance) * strength;
        }

        const rotate =
          Math.sin(timeSeconds * (0.24 + (seed % 5) * 0.015) + phase) *
          (artifact.rotationSwing ?? 3);
        const scale =
          reducedMotion || artifact.pulseScale === undefined
            ? 1
            : 1 +
              Math.sin(timeSeconds * (0.72 + (seed % 7) * 0.02) + phase) *
                (artifact.pulseScale - 1);

        node.style.transform = `translate3d(${driftX + sway + orbitX + repulsionX}px, ${driftY + orbitY + parallax + repulsionY}px, 0) rotate(${rotate}deg) scale(${scale})`;
      }

      animationFrameId = window.requestAnimationFrame(updateTransforms);
    };

    const handleMouseMove = (event: MouseEvent) => {
      targetMouse.x = event.clientX;
      targetMouse.y = event.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animationFrameId = window.requestAnimationFrame(updateTransforms);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const registerStageRef = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) {
      stageRefs.current.set(id, node);
      return;
    }

    stageRefs.current.delete(id);
  }, []);

  if (!activeTheme) {
    return null;
  }

  return (
    <div
      className={styles.floatingArtifactsContainer}
      data-ambient-visible={ambientVisible ? "true" : "false"}
    >
      {visibleArtifacts.map((artifact) => (
        <Artifact
          key={artifact.id}
          artifact={artifact}
          ambientVisible={ambientVisible}
          registerStageRef={registerStageRef}
        />
      ))}
    </div>
  );
}
