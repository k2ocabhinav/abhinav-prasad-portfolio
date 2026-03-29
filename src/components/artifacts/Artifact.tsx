"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, animate, useSpring } from "motion/react";
import type { ArtifactDef } from "@/types";

// Shared mouse position using plain object (no hooks at module level)
const sharedMouse = { x: -1000, y: -1000 };

interface ArtifactProps {
  artifact: ArtifactDef;
}

function getStableDelay(seed: string): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return (hash % 2000) / 1000;
}

export function Artifact({ artifact }: ArtifactProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Stable per-artifact delay so motion feels organic without impure render work.
  const initialDelay = getStableDelay(artifact.id);

  // Scroll-based parallax - use percentage-based scroll range
  const { scrollYProgress } = useScroll();
  const [scrollStart, scrollEnd] = artifact.scrollRange;
  const parallaxY = useTransform(
    scrollYProgress,
    [scrollStart / 100, scrollEnd / 100],
    [-30, 30]
  );

  // Motion values for animations
  const yMotion = useMotionValue(0);
  const rotateMotion = useMotionValue(0);

  // Check reduced motion preference on mount (client-side only)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Track mouse position globally (shared across all artifacts)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      sharedMouse.x = e.clientX;
      sharedMouse.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Mouse repulsion spring - useSpring with damping, stiffness, mass
  const repulsionX = useSpring(0, { damping: 25, stiffness: 150, mass: 0.4 });
  const repulsionY = useSpring(0, { damping: 25, stiffness: 150, mass: 0.4 });

  // Calculate mouse repulsion when mouse is near artifact
  useEffect(() => {
    if (prefersReducedMotion) {
      repulsionX.set(0);
      repulsionY.set(0);
      return;
    }

    const INFLUENCE_RADIUS = 120;
    const MAX_DISPLACEMENT = 50;

    const calculateRepulsion = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const artifactCenterX = rect.left + rect.width / 2;
      const artifactCenterY = rect.top + rect.height / 2;

      const mouseXVal = sharedMouse.x;
      const mouseYVal = sharedMouse.y;

      const dx = artifactCenterX - mouseXVal;
      const dy = artifactCenterY - mouseYVal;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < INFLUENCE_RADIUS && distance > 0) {
        // Normalize direction and calculate repulsion strength
        const normalizedDistance = distance / INFLUENCE_RADIUS;
        const strength = (1 - normalizedDistance) * MAX_DISPLACEMENT;

        const repulsionXVal = (dx / distance) * strength;
        const repulsionYVal = (dy / distance) * strength;

        repulsionX.set(repulsionXVal);
        repulsionY.set(repulsionYVal);
      } else {
        repulsionX.set(0);
        repulsionY.set(0);
      }
    };

    // Use animation frame for smooth updates
    let animationId: number;
    const loop = () => {
      calculateRepulsion();
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationId);
  }, [prefersReducedMotion, repulsionX, repulsionY]);

  // Bobbing animation
  useEffect(() => {
    if (prefersReducedMotion) return;

    const controls = animate(yMotion, [0, -artifact.bobAmplitude, 0], {
      duration: artifact.bobDuration,
      repeat: Infinity,
      repeatType: "reverse",
      delay: initialDelay,
      ease: "easeInOut",
    });

    return () => controls.stop();
  }, [prefersReducedMotion, yMotion, artifact.bobAmplitude, artifact.bobDuration, initialDelay]);

  // Rotation animation
  useEffect(() => {
    if (prefersReducedMotion) return;

    const controls = animate(
      rotateMotion,
      [0, artifact.rotationSwing, 0, -artifact.rotationSwing, 0],
      {
        duration: artifact.bobDuration * 1.5,
        repeat: Infinity,
        repeatType: "loop",
        delay: initialDelay + 0.5,
        ease: "easeInOut",
      }
    );

    return () => controls.stop();
  }, [prefersReducedMotion, rotateMotion, artifact.rotationSwing, artifact.bobDuration, initialDelay]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: `${artifact.x}%`,
        top: `${artifact.y}%`,
        width: artifact.size,
        height: artifact.size,
        zIndex: 75,
        pointerEvents: "none" as const,
      }}
    >
      {/* Parallax container - handles scroll-based Y drift */}
      <motion.div style={{ y: parallaxY }}>
        {/* Repulsion container - handles mouse proximity displacement */}
        <motion.div
          style={{
            x: repulsionX,
            y: repulsionY,
          }}
        >
          {/* Bob container - handles floating animation */}
          <motion.div style={{ y: yMotion }}>
            {/* Rotation container - handles subtle rotation */}
            <motion.div style={{ rotate: rotateMotion }}>
              <svg
                width={artifact.size}
                height={artifact.size}
                viewBox={artifact.viewBox || "0 0 24 24"}
                style={{ opacity: artifact.opacity }}
              >
                <path
                  d={artifact.svgPath}
                  fill={artifact.fill}
                  stroke={artifact.stroke}
                  strokeWidth={artifact.strokeWidth}
                />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Artifact;
