"use client";

import {
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./SheetLight.module.css";

interface SheetLightProps {
  children: ReactNode;
}

interface CachedPoint {
  element: HTMLElement;
  x: number;
  y: number;
  radius: number;
  near: number;
}

interface ScrollValues {
  progress: number;
  tilt: number;
  lift: number;
  scale: number;
  shade: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const format = (value: number) => value.toFixed(4);

// --sx/--sy are inherited by the whole hero, so each write restyles every
// descendant. They are written with 2 decimals (a 0.01 step is about 0.03px of ink
// offset): still smooth, but the restyle only happens on frames where it moved.

export default function SheetLight({ children }: SheetLightProps) {
  const heroRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const pressShadeRef = useRef<HTMLDivElement>(null);
  const fibreRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const lightX = useMotionValue(0);
  const lightY = useMotionValue(0);
  const springX = useSpring(lightX, { stiffness: 90, damping: 20 });
  const springY = useSpring(lightY, { stiffness: 90, damping: 20 });
  const shadowX = useMotionValue(0.7);
  const shadowY = useMotionValue(0.7);
  const springShadowX = useSpring(shadowX, { stiffness: 90, damping: 20 });
  const springShadowY = useSpring(shadowY, { stiffness: 90, damping: 20 });
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const scrollValues = useRef<ScrollValues>({
    progress: 0,
    tilt: 0,
    lift: 0,
    scale: 1,
    shade: 0,
  });

  // One subscription maps the exit progress onto every exit value (the same
  // linear ranges as five separate transforms, without five motion values and
  // five listeners running on every scroll tick).
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const values = scrollValues.current;
    values.progress = value;
    values.tilt = value * 16;
    values.lift = value * -6;
    values.scale = 1 - value * 0.05;
    values.shade = value * 0.14;
  });

  useEffect(() => {
    const canvas = fibreRef.current;
    if (!canvas || !window.matchMedia("(max-width: 767px)").matches) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      return;
    }

    const image = new Image();
    image.decoding = "async";
    let canvasWidth = 0;
    let canvasHeight = 0;

    const drawTexture = () => {
      if (!image.complete || image.naturalWidth === 0 || canvasWidth <= 0 || canvasHeight <= 0) {
        return;
      }

      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvasWidth * pixelRatio);
      canvas.height = Math.round(canvasHeight * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, canvasWidth, canvasHeight);

      const pattern = context.createPattern(image, "repeat");
      if (!pattern) {
        return;
      }

      context.fillStyle = pattern;
      context.fillRect(0, 0, canvasWidth, canvasHeight);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      const bounds = entries[0]?.contentRect;
      if (!bounds) {
        return;
      }

      canvasWidth = bounds.width;
      canvasHeight = bounds.height;
      drawTexture();
    });

    resizeObserver.observe(canvas);
    image.onload = drawTexture;
    image.src = "/landing/paper-fibre.avif";

    return () => {
      resizeObserver.disconnect();
      image.onload = null;
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const sheet = sheetRef.current;
    const sheen = sheenRef.current;
    const pressShade = pressShadeRef.current;
    if (!hero || !sheet || !sheen || !pressShade || reducedMotion !== false) {
      return;
    }

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const letterElements = Array.from(
      hero.querySelectorAll<HTMLElement>("[data-hero-letter]")
    );
    const points: CachedPoint[] = letterElements.map((element) => ({
      element,
      x: 0,
      y: 0,
      radius: 1,
      near: 1,
    }));
    const sheetBounds = { left: 0, top: 0, width: 0, height: 0 };
    const pointer = { x: 0, y: 0, active: false };
    let viewportWidth = window.innerWidth;
    let targetX = 0;
    let targetY = 0;
    let layoutReady = false;
    let lastPointerMove = performance.now();
    let heroVisible = false;
    let lightReady = false;
    let frameId = 0;
    let loadReadyTimeout = 0;
    let lastFrameTime = 0;
    // Exit progress at the last letter-box read. While the sheet bends, the
    // letter offsets drift smoothly with progress, so they are re-read when it
    // has moved 0.015 (about 14px of scroll) rather than on every frame.
    let lastLetterReadProgress = 0;

    // --exit-depth scales the ink shadows as the sheet leaves. Only the wordmark
    // layers and the CTA group read it, so it is written there, not on the sheet.
    const depthTargets = Array.from(
      hero.querySelectorAll<HTMLElement>(
        "[data-hero-print-layer],[data-hero-ctas]"
      )
    );

    // `full` re-reads every letter box and font size (resize, font swap). A plain
    // scroll only moves the sheet through the viewport, so the letters' offsets
    // inside it stay valid unless the exit transform is bending the sheet.
    const cacheLayout = (full = true) => {
      const bounds = sheet.getBoundingClientRect();
      sheetBounds.left = bounds.left;
      sheetBounds.top = bounds.top;
      sheetBounds.width = bounds.width;
      sheetBounds.height = bounds.height;

      // Back at rest after an exit: one more read settles the letters exactly.
      const exitProgress = scrollValues.current.progress;
      if (
        full ||
        Math.abs(exitProgress - lastLetterReadProgress) >= (exitProgress ? 0.015 : 1e-9)
      ) {
        lastLetterReadProgress = exitProgress;
        for (const point of points) {
          const rect = point.element.getBoundingClientRect();
          point.x = rect.left - bounds.left + rect.width / 2;
          point.y = rect.top - bounds.top + rect.height / 2;
          if (full) {
            point.radius = Math.max(
              1,
              parseFloat(getComputedStyle(point.element).fontSize) * 0.6
            );
          }
        }
      }

      if (
        !layoutReady &&
        !pointer.active &&
        sheetBounds.width > 0 &&
        sheetBounds.height > 0
      ) {
        targetX = sheetBounds.width * 0.2;
        targetY = sheetBounds.height * 0.2;
        lightX.set(targetX);
        lightY.set(targetY);
      } else if (pointer.active) {
        targetX = pointer.x - sheetBounds.left;
        targetY = pointer.y - sheetBounds.top;
      }
      layoutReady = true;
    };

    const resizeObserver = new ResizeObserver(() => cacheLayout());
    resizeObserver.observe(sheet);
    const content = hero.querySelector<HTMLElement>("[data-hero-content]");
    if (content) {
      resizeObserver.observe(content);
    }
    for (const point of points) {
      resizeObserver.observe(point.element);
    }
    cacheLayout();

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      lastPointerMove = performance.now();
    };
    const onResize = () => {
      viewportWidth = window.innerWidth;
      cacheLayout();
    };
    // Scrolling only invalidates the cached sheet position while the hero is on
    // screen. Off screen there is nothing to read; the IntersectionObserver
    // refreshes the cache when the hero returns.
    const onScroll = () => {
      if (heroVisible) {
        cacheLayout(false);
      }
    };
    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    const enableLight = () => {
      if (lightReady) {
        return;
      }
      lightReady = true;
      window.clearTimeout(loadReadyTimeout);
      start();
    };
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName.includes("lamp-swing")) {
        enableLight();
      }
    };
    sheet.addEventListener("animationend", onAnimationEnd);
    loadReadyTimeout = window.setTimeout(
      enableLight,
      Math.max(0, 1700 - performance.now())
    );

    const writeLight = (time: number) => {
      if (!heroVisible || document.hidden) {
        frameId = 0;
        return;
      }

      const width = sheetBounds.width;
      const height = sheetBounds.height;
      if (width > 0 && height > 0) {
        const frameDuration = lastFrameTime === 0 ? 16.67 : Math.min(time - lastFrameTime, 64);
        lastFrameTime = time;
        const nearSmoothing = 1 - Math.exp(-frameDuration / 90);
        const scroll = scrollValues.current;

        // The exit transform is written on the sheet itself (the same function
        // list as the CSS rest state), so no inherited variable restyles the hero.
        sheet.style.setProperty(
          "transform",
          `rotateX(${format(scroll.tilt)}deg) translateY(${format(scroll.lift)}%) scale(${format(scroll.scale)})`
        );
        const depth = (1 - scroll.progress * 0.5).toFixed(2);
        for (const target of depthTargets) {
          target.style.setProperty("--exit-depth", depth);
        }
        pressShade.style.setProperty("--shade", format(scroll.shade));
        sheet.style.setProperty(
          "will-change",
          scroll.progress > 0 && scroll.progress < 1 ? "transform" : "auto"
        );

        if (lightReady) {
          const isFineDesktop = finePointer && viewportWidth >= 1024;
          const isIdle = time - lastPointerMove >= 4000;
          if (!isFineDesktop || isIdle) {
            const phase = (time / 14000) * Math.PI * 2;
            const driftX = width * (0.2 + Math.cos(phase) * 0.18);
            const driftY = height * (0.2 + Math.sin(phase) * 0.18);
            const phoneAngle =
              viewportWidth < 768
                ? scroll.progress * (25 * Math.PI / 180)
                : 0;
            const centerX = width / 2;
            const centerY = height / 2;
            const offsetX = driftX - centerX;
            const offsetY = driftY - centerY;
            targetX = centerX + offsetX * Math.cos(phoneAngle) - offsetY * Math.sin(phoneAngle);
            targetY = centerY + offsetX * Math.sin(phoneAngle) + offsetY * Math.cos(phoneAngle);
          } else if (pointer.active) {
            targetX = pointer.x - sheetBounds.left;
            targetY = pointer.y - sheetBounds.top;
          }

          lightX.set(targetX);
          lightY.set(targetY);
          const lightPositionX = springX.get();
          const lightPositionY = springY.get();
          const directionX = width / 2 - lightPositionX;
          const directionY = height / 2 - lightPositionY;
          const magnitude = Math.hypot(directionX, directionY) || 1;
          const sx = clamp((directionX / magnitude) * 0.6 + 0.7 * 0.4, -0.85, 0.85);
          const sy = clamp((directionY / magnitude) * 0.6 + 0.7 * 0.4, -0.85, 0.85);
          shadowX.set(sx);
          shadowY.set(sy);
          const smoothedShadowX = springShadowX.get();
          const smoothedShadowY = springShadowY.get();

          sheet.style.setProperty("--sx", smoothedShadowX.toFixed(2));
          sheet.style.setProperty("--sy", smoothedShadowY.toFixed(2));
          sheen.style.setProperty("--lx", `${format(lightPositionX)}px`);
          sheen.style.setProperty("--ly", `${format(lightPositionY)}px`);

          const updateNear = (point: CachedPoint) => {
            const distance = Math.hypot(point.x - lightPositionX, point.y - lightPositionY);
            const targetNear = 1 + 0.6 * Math.max(0, 1 - distance / point.radius);
            const near = point.near + (targetNear - point.near) * nearSmoothing;
            if (Math.abs(near - point.near) < 0.004) {
              return;
            }
            point.near = near;
            point.element.style.setProperty("--near", format(near));
          };

          for (const point of points) {
            updateNear(point);
          }
        }
      }

      frameId = requestAnimationFrame(writeLight);
    };

    const start = () => {
      if (heroVisible && !document.hidden && frameId === 0) {
        frameId = requestAnimationFrame(writeLight);
      }
    };
    const stop = () => {
      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
      lastFrameTime = 0;
      // Nothing animates while the loop is stopped: release the sheet's layer.
      sheet.style.setProperty("will-change", "auto");
      springX.stop();
      springY.stop();
      springShadowX.stop();
      springShadowY.stop();
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible) {
        cacheLayout(false);
        start();
      } else {
        stop();
      }
    });
    intersectionObserver.observe(hero);

    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      sheet.removeEventListener("animationend", onAnimationEnd);
      window.clearTimeout(loadReadyTimeout);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [
    lightX,
    lightY,
    reducedMotion,
    shadowX,
    shadowY,
    springShadowX,
    springShadowY,
    springX,
    springY,
  ]);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/landing/paper-fibre.avif"
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <section
        ref={heroRef}
        id="hero"
        className={styles.hero}
        aria-label="Hero"
        data-hero="true"
      >
        <div className={styles.frame} data-home-hero-frame="true">
          <div ref={sheetRef} className={styles.sheet} data-hero-sheet="true">
            <div className={styles.paper} aria-hidden="true">
              <canvas ref={fibreRef} className={styles.fibre} />
              <div ref={sheenRef} className={styles.sheen} />
            </div>
            <div className={styles.content} data-hero-content="true">
              <div className={styles.layout}>{children}</div>
            </div>
            <div ref={pressShadeRef} className={styles.pressShade} aria-hidden="true" />
          </div>
        </div>
      </section>
    </>
  );
}
