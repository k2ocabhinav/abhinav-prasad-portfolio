"use client";

import {
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
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

export default function SheetLight({ children }: SheetLightProps) {
  const heroRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
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
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const tilt = useTransform(scrollYProgress, [0, 1], [0, 16]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -6]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const shade = useTransform(scrollYProgress, [0, 1], [0, 0.14]);
  const scrollValues = useRef<ScrollValues>({
    progress: 0,
    tilt: 0,
    lift: 0,
    scale: 1,
    shade: 0,
  });

  useMotionValueEvent(progress, "change", (value) => {
    scrollValues.current.progress = value;
  });
  useMotionValueEvent(tilt, "change", (value) => {
    scrollValues.current.tilt = value;
  });
  useMotionValueEvent(lift, "change", (value) => {
    scrollValues.current.lift = value;
  });
  useMotionValueEvent(scale, "change", (value) => {
    scrollValues.current.scale = value;
  });
  useMotionValueEvent(shade, "change", (value) => {
    scrollValues.current.shade = value;
  });

  useEffect(() => {
    const hero = heroRef.current;
    const sheet = sheetRef.current;
    if (!hero || !sheet || reducedMotion !== false) {
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
    const cachedProperties = new Map<string, string>();
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

    const setSheetProperty = (name: string, value: string) => {
      if (cachedProperties.get(name) === value) {
        return;
      }
      cachedProperties.set(name, value);
      sheet.style.setProperty(name, value);
    };

    const cacheLayout = () => {
      const bounds = sheet.getBoundingClientRect();
      sheetBounds.left = bounds.left;
      sheetBounds.top = bounds.top;
      sheetBounds.width = bounds.width;
      sheetBounds.height = bounds.height;

      for (const point of points) {
        const rect = point.element.getBoundingClientRect();
        point.x = rect.left - bounds.left + rect.width / 2;
        point.y = rect.top - bounds.top + rect.height / 2;
        point.radius = Math.max(1, parseFloat(getComputedStyle(point.element).fontSize) * 0.6);
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

    const resizeObserver = new ResizeObserver(cacheLayout);
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
    const onScrollOrResize = () => {
      viewportWidth = window.innerWidth;
      cacheLayout();
    };
    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

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

        setSheetProperty("--p", format(scroll.progress));
        setSheetProperty("--exit-tilt", `${format(scroll.tilt)}deg`);
        setSheetProperty("--exit-lift", `${format(scroll.lift)}%`);
        setSheetProperty("--exit-scale", format(scroll.scale));
        setSheetProperty("--shade", format(scroll.shade));
        setSheetProperty(
          "--exit-will-change",
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

          setSheetProperty("--sx", format(smoothedShadowX));
          setSheetProperty("--sy", format(smoothedShadowY));
          setSheetProperty("--lx", `${format(lightPositionX)}px`);
          setSheetProperty("--ly", `${format(lightPositionY)}px`);

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
      springX.stop();
      springY.stop();
      springShadowX.stop();
      springShadowY.stop();
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible) {
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
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
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
              <div className={styles.fibre} />
              <div className={styles.sheen} />
            </div>
            <div className={styles.content} data-hero-content="true">
              <div className={styles.layout}>{children}</div>
            </div>
            <div className={styles.pressShade} aria-hidden="true" />
          </div>
        </div>
      </section>
    </>
  );
}
