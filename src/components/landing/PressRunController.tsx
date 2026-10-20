"use client";

import { useEffect, useRef } from "react";
import * as m from "motion/react-m";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./PressRunController.module.css";

interface SpringAxis {
  position: number;
  velocity: number;
}

interface CropMarkProps {
  corner: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
}

const springFrequency = 18;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function advanceSpring(axis: SpringAxis, target: number, delta: number): boolean {
  const displacement = axis.position - target;
  const coefficient = axis.velocity + springFrequency * displacement;
  const decay = Math.exp(-springFrequency * delta);

  axis.position = target + (displacement + coefficient * delta) * decay;
  axis.velocity =
    (axis.velocity - springFrequency * coefficient * delta) * decay;

  if (Math.abs(axis.position - target) < 0.01 && Math.abs(axis.velocity) < 0.01) {
    axis.position = target;
    axis.velocity = 0;
    return false;
  }

  return true;
}

function CropMark({ corner }: CropMarkProps) {
  return (
    <svg
      className={`${styles.cropMark} ${styles[corner]}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M23 1H1v22" />
    </svg>
  );
}

export default function PressRunController() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const scene = sceneRef.current;
    const frame = scene?.closest<HTMLElement>("[data-home-hero-frame]");
    const heading = frame?.querySelector<HTMLHeadingElement>("h1");
    const plate = heading?.querySelector<HTMLElement>("[data-ink-plate-drift='true']");
    const glacier = scene?.querySelector<HTMLElement>("[data-pressrun-depth='glacier']");
    const target = scene?.querySelector<HTMLElement>("[data-pressrun-depth='target']");
    const strip = frame?.querySelector<HTMLAnchorElement>("[data-pressrun-strip]");

    if (!scene || !frame || !heading || !plate || !glacier || !target || !strip) {
      return;
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    const reducedMotion = prefersReducedMotion || reducedMotionQuery.matches;

    scene.dataset.reduceMotion = reducedMotion ? "true" : "false";
    heading.dataset.reduceMotion = reducedMotion ? "true" : "false";
    strip.dataset.reduceMotion = reducedMotion ? "true" : "false";

    if (reducedMotion) {
      scene.dataset.pass = "false";
      heading.dataset.pass = "false";
      strip.dataset.pass = "false";
      return;
    }

    let frameRequest = 0;
    let firstPaintFrame = 0;
    let secondPaintFrame = 0;
    let previousFrameTime = 0;
    let inView = true;
    let finePointer = finePointerQuery.matches;
    let pointerX = 0;
    let pointerY = 0;
    let scrollProgress = 0;
    let rootWidth = 0;
    let rootHeight = 0;
    let rootDocumentLeft = 0;
    let rootDocumentTop = 0;
    let targetDocumentX = 0;
    let targetDocumentY = 0;
    let nearTarget = false;
    let stripActive = false;
    let unlockTimer = 0;
    let hasWillChange = false;

    const pointerPlateX: SpringAxis = { position: 0, velocity: 0 };
    const pointerPlateY: SpringAxis = { position: 0, velocity: 0 };
    const pointerGlacierX: SpringAxis = { position: 0, velocity: 0 };
    const pointerGlacierY: SpringAxis = { position: 0, velocity: 0 };
    const pointerTargetX: SpringAxis = { position: 0, velocity: 0 };
    const pointerTargetY: SpringAxis = { position: 0, velocity: 0 };

    const setLock = (locked: boolean) => {
      const value = locked ? "true" : "false";
      scene.dataset.lock = value;
      heading.dataset.lock = value;
    };

    const releaseLockSoon = () => {
      if (stripActive || nearTarget) return;
      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => setLock(false), 320);
    };

    const setWillChange = (active: boolean) => {
      if (hasWillChange === active) return;
      hasWillChange = active;
      const value = active ? "transform" : "";
      plate.style.willChange = value;
      glacier.style.willChange = value;
      target.style.willChange = value;
    };

    const readRects = () => {
      const rootRect = frame.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      rootWidth = rootRect.width;
      rootHeight = rootRect.height;
      rootDocumentLeft = rootRect.left + window.scrollX;
      rootDocumentTop = rootRect.top + window.scrollY;
      targetDocumentX =
        rootDocumentLeft + targetRect.left - rootRect.left + targetRect.width / 2;
      targetDocumentY =
        rootDocumentTop + targetRect.top - rootRect.top + targetRect.height / 2;
      updateScrollProgress();
    };

    const updateScrollProgress = () => {
      if (rootHeight <= 0) {
        scrollProgress = 0;
        return;
      }
      scrollProgress = clamp(
        (window.scrollY - rootDocumentTop) / rootHeight,
        0,
        1
      );
    };

    const canAnimate = () =>
      inView && document.visibilityState === "visible" && !reducedMotionQuery.matches;

    const setPaused = () => {
      const paused = !inView || document.visibilityState !== "visible";
      scene.dataset.paused = paused ? "true" : "false";
      heading.dataset.paused = paused ? "true" : "false";
      strip.dataset.paused = paused ? "true" : "false";

      if (paused && frameRequest !== 0) {
        window.cancelAnimationFrame(frameRequest);
        frameRequest = 0;
        previousFrameTime = 0;
        setWillChange(false);
      } else if (!paused) {
        scheduleFrame();
      }
    };

    const scheduleFrame = () => {
      if (frameRequest === 0 && canAnimate()) {
        setWillChange(true);
        frameRequest = window.requestAnimationFrame(animate);
      }
    };

    const animate = (timestamp: number) => {
      frameRequest = 0;
      if (!canAnimate()) {
        setWillChange(false);
        return;
      }

      const delta = previousFrameTime === 0
        ? 1 / 60
        : Math.min((timestamp - previousFrameTime) / 1000, 0.032);
      previousFrameTime = timestamp;

      const plateMovingX = advanceSpring(pointerPlateX, pointerX, delta);
      const plateMovingY = advanceSpring(pointerPlateY, pointerY, delta);
      const glacierMovingX = advanceSpring(pointerGlacierX, pointerX, delta);
      const glacierMovingY = advanceSpring(pointerGlacierY, pointerY, delta);
      const targetMovingX = advanceSpring(pointerTargetX, pointerX, delta);
      const targetMovingY = advanceSpring(pointerTargetY, pointerY, delta);

      plate.style.transform = `translate3d(${(pointerPlateX.position * 5).toFixed(2)}px, ${(pointerPlateY.position * 5 - scrollProgress * 6).toFixed(2)}px, 0)`;
      glacier.style.transform = `translate3d(${(pointerGlacierX.position * 3).toFixed(2)}px, ${(pointerGlacierY.position * 3 + scrollProgress * 12).toFixed(2)}px, 0)`;
      target.style.transform = `translate3d(${(pointerTargetX.position * 2).toFixed(2)}px, ${(pointerTargetY.position * 2).toFixed(2)}px, 0)`;

      if (
        plateMovingX ||
        plateMovingY ||
        glacierMovingX ||
        glacierMovingY ||
        targetMovingX ||
        targetMovingY
      ) {
        scheduleFrame();
      } else {
        previousFrameTime = 0;
        setWillChange(false);
      }
    };

    const updateTargetLock = (clientX: number, clientY: number) => {
      const distanceX = clientX - (targetDocumentX - window.scrollX);
      const distanceY = clientY - (targetDocumentY - window.scrollY);
      const isNear = Math.hypot(distanceX, distanceY) <= 20;

      if (nearTarget === isNear) return;
      nearTarget = isNear;
      if (nearTarget) {
        window.clearTimeout(unlockTimer);
        setLock(true);
      } else {
        releaseLockSoon();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer || event.pointerType === "touch") return;
      pointerX = clamp((event.clientX / rootWidth - 0.5) * 2, -1, 1);
      pointerY = clamp((event.clientY / window.innerHeight - 0.5) * 2, -1, 1);
      updateTargetLock(event.clientX, event.clientY);
      scheduleFrame();
    };

    const resetPointer = () => {
      pointerX = 0;
      pointerY = 0;
      nearTarget = false;
      releaseLockSoon();
      scheduleFrame();
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) resetPointer();
    };

    const handleScroll = () => {
      updateScrollProgress();
      scheduleFrame();
    };

    const handleStripEnter = () => {
      stripActive = true;
      window.clearTimeout(unlockTimer);
      setLock(true);
    };

    const handleStripLeave = () => {
      stripActive = false;
      releaseLockSoon();
    };

    const handleVisibilityChange = () => setPaused();
    const handlePointerCapabilityChange = (event: MediaQueryListEvent) => {
      finePointer = event.matches;
      if (!finePointer) resetPointer();
    };

    const resizeObserver = new ResizeObserver(() => {
      readRects();
      scheduleFrame();
    });
    resizeObserver.observe(frame);
    resizeObserver.observe(target);
    readRects();

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        setPaused();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(frame);

    scene.dataset.paused = "false";
    scene.dataset.lock = "false";
    heading.dataset.paused = "false";
    heading.dataset.lock = "false";

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerOut, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", readRects, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    finePointerQuery.addEventListener("change", handlePointerCapabilityChange);
    strip.addEventListener("pointerenter", handleStripEnter);
    strip.addEventListener("pointerleave", handleStripLeave);
    strip.addEventListener("focusin", handleStripEnter);
    strip.addEventListener("focusout", handleStripLeave);

    firstPaintFrame = window.requestAnimationFrame(() => {
      secondPaintFrame = window.requestAnimationFrame(() => {
        scene.dataset.pass = "true";
        heading.dataset.pass = "true";
        strip.dataset.pass = "true";
      });
    });
    scheduleFrame();

    return () => {
      if (frameRequest !== 0) window.cancelAnimationFrame(frameRequest);
      if (firstPaintFrame !== 0) window.cancelAnimationFrame(firstPaintFrame);
      if (secondPaintFrame !== 0) window.cancelAnimationFrame(secondPaintFrame);
      window.clearTimeout(unlockTimer);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", readRects);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      finePointerQuery.removeEventListener("change", handlePointerCapabilityChange);
      strip.removeEventListener("pointerenter", handleStripEnter);
      strip.removeEventListener("pointerleave", handleStripLeave);
      strip.removeEventListener("focusin", handleStripEnter);
      strip.removeEventListener("focusout", handleStripLeave);
      setWillChange(false);
    };
  }, [prefersReducedMotion]);

  return (
    <>
    <div
      ref={sceneRef}
      className={styles.scene}
      data-pressrun-scene="true"
      data-pass="false"
      data-reduce-motion="false"
      data-paused="false"
      aria-hidden="true"
    >
      <div className={styles.cropMarks} aria-hidden="true">
        <CropMark corner="topLeft" />
        <CropMark corner="topRight" />
        <CropMark corner="bottomLeft" />
        <CropMark corner="bottomRight" />
      </div>

      <div className={styles.glacierDepth} data-pressrun-depth="glacier" aria-hidden="true">
        <svg
          className={styles.glacierPlate}
          viewBox="0 0 320 170"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <pattern id="pressrun-glacier-dots-small" width="12" height="12" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.1" fill="#D7EFFF" />
            </pattern>
            <pattern id="pressrun-glacier-dots-medium" width="20" height="20" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.8" fill="#D7EFFF" />
            </pattern>
            <pattern id="pressrun-glacier-dots-large" width="28" height="28" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="2.8" fill="#D7EFFF" />
            </pattern>
            <linearGradient id="pressrun-glacier-growth-medium" x1="0" y1="0" x2="320" y2="170" gradientUnits="userSpaceOnUse">
              <stop offset="0.18" stopColor="white" stopOpacity="0" />
              <stop offset="0.62" stopColor="white" stopOpacity="0.7" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
            <linearGradient id="pressrun-glacier-growth-large" x1="0" y1="0" x2="320" y2="170" gradientUnits="userSpaceOnUse">
              <stop offset="0.42" stopColor="white" stopOpacity="0" />
              <stop offset="0.78" stopColor="white" stopOpacity="0.55" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
            <radialGradient id="pressrun-glacier-fade" cx="78%" cy="78%" r="78%">
              <stop offset="0" stopColor="white" stopOpacity="0.82" />
              <stop offset="0.58" stopColor="white" stopOpacity="0.46" />
              <stop offset="1" stopColor="black" stopOpacity="0" />
            </radialGradient>
            <mask id="pressrun-glacier-growth-mask-medium" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="170">
              <rect width="320" height="170" fill="url(#pressrun-glacier-growth-medium)" />
            </mask>
            <mask id="pressrun-glacier-growth-mask-large" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="170">
              <rect width="320" height="170" fill="url(#pressrun-glacier-growth-large)" />
            </mask>
            <mask id="pressrun-glacier-edge-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="170">
              <rect width="320" height="170" fill="url(#pressrun-glacier-fade)" />
            </mask>
          </defs>
          <g mask="url(#pressrun-glacier-edge-mask)">
            <rect width="320" height="170" fill="url(#pressrun-glacier-dots-small)" opacity="0.78" />
            <rect
              width="320"
              height="170"
              fill="url(#pressrun-glacier-dots-medium)"
              mask="url(#pressrun-glacier-growth-mask-medium)"
              opacity="0.82"
            />
            <rect
              width="320"
              height="170"
              fill="url(#pressrun-glacier-dots-large)"
              mask="url(#pressrun-glacier-growth-mask-large)"
              opacity="0.88"
            />
          </g>
        </svg>
        <span className={styles.glacierRoller} data-pressrun-roller="true" />
      </div>

      <span className={styles.targetDepth} data-pressrun-depth="target" aria-hidden="true">
        <m.svg
          className={styles.registrationTarget}
          viewBox="0 0 28 28"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="14" cy="14" r="9" />
          <path d="M14 0v28M0 14h28" />
          <circle cx="14" cy="14" r="1" />
        </m.svg>
      </span>

    </div>
    <a
      className={styles.calibrationStrip}
      href="#about"
      aria-label="Scroll to What I do. Print plates: Glacier, Burgundy, and Black cherry."
      data-pressrun-strip="true"
      data-pass="false"
      data-reduce-motion="false"
      data-paused="false"
    >
      <span className={styles.swatches} aria-hidden="true">
        <span className={styles.swatch} data-plate="glacier">
          <span className={styles.fullLabel} data-full-label="true">Plate 1 | Glacier</span>
          <span className={styles.compactLabel} data-compact-label="true">P1</span>
        </span>
        <span className={styles.swatch} data-plate="burgundy">
          <span className={styles.fullLabel} data-full-label="true">Plate 2 | Burgundy</span>
          <span className={styles.compactLabel} data-compact-label="true">P2</span>
        </span>
        <span className={styles.swatch} data-plate="cherry">
          <span className={styles.fullLabel} data-full-label="true">Plate 3 | Black cherry</span>
          <span className={styles.compactLabel} data-compact-label="true">P3</span>
        </span>
      </span>
      <span className={styles.scrollCue}>What I do <span aria-hidden="true">↓</span></span>
    </a>
    </>
  );
}
