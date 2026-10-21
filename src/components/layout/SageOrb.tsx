"use client";

import { useEffect, useRef } from "react";
import { getSectionSnapshot, subscribeToSection } from "@/lib/sectionStore";
import styles from "./SageOrb.module.css";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, summary, [data-cursor], [data-cursor-grow]";
const DARK_SELECTOR =
  ".spec-sheet, [data-cursor-theme='dark'], [data-cursor-theme='dark-hover']:hover";

export default function SageOrb() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!cursor) return;

    let targetX = -20;
    let targetY = -20;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;
    let attached = false;
    let unsubscribeSection = () => {};

    // The cursor turns pale over dark ink fields. It reads the shared section
    // store for page-level dark bands (the marquee) and the pointer target for
    // dark sub-surfaces (spec sheets) that sit on paper sections.
    let sectionIsDark = getSectionSnapshot().dark;
    let pointerOnDarkSurface = false;

    const applyTheme = () => {
      cursor.dataset.theme = String(sectionIsDark || pointerOnDarkSurface);
    };

    const animate = () => {
      frame = 0;
      currentX += (targetX - currentX) * 0.24;
      currentY += (targetY - currentY) * 0.24;

      const settled =
        Math.abs(targetX - currentX) <= 0.1 && Math.abs(targetY - currentY) <= 0.1;

      cursor.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) translate(-50%, -50%)`;
      if (settled) {
        cursor.dataset.moving = "false";
        return;
      }

      frame = window.requestAnimationFrame(animate);
    };

    const schedule = () => {
      cursor.dataset.moving = "true";
      if (frame === 0) frame = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.dataset.visible = "true";

      const target = event.target;
      const element = target instanceof Element ? target : null;
      cursor.dataset.active = String(
        element?.closest(INTERACTIVE_SELECTOR) !== null && element !== null
      );
      pointerOnDarkSurface =
        element?.closest(DARK_SELECTOR) !== null && element !== null;
      applyTheme();
      schedule();
    };

    const hide = () => {
      cursor.dataset.visible = "false";
      cursor.dataset.active = "false";
      cursor.dataset.moving = "false";
    };

    const handlePointerLeave = (event: PointerEvent) => {
      if (event.relatedTarget === null) hide();
    };

    const enable = () => {
      if (
        attached ||
        !finePointer.matches ||
        reducedMotion.matches ||
        document.visibilityState !== "visible"
      ) {
        return;
      }
      attached = true;
      sectionIsDark = getSectionSnapshot().dark;
      unsubscribeSection = subscribeToSection(() => {
        sectionIsDark = getSectionSnapshot().dark;
        applyTheme();
      });
      applyTheme();
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerout", handlePointerLeave, { passive: true });
      window.addEventListener("blur", hide);
    };

    const disable = () => {
      attached = false;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerLeave);
      window.removeEventListener("blur", hide);
      unsubscribeSection();
      unsubscribeSection = () => {};
      hide();
      pointerOnDarkSurface = false;
      applyTheme();
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const syncAvailability = () => {
      disable();
      enable();
    };

    enable();
    finePointer.addEventListener("change", syncAvailability);
    reducedMotion.addEventListener("change", syncAvailability);
    document.addEventListener("visibilitychange", syncAvailability);

    return () => {
      disable();
      finePointer.removeEventListener("change", syncAvailability);
      reducedMotion.removeEventListener("change", syncAvailability);
      document.removeEventListener("visibilitychange", syncAvailability);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={styles.orb}
      data-site-chrome="cursor-orb"
      data-visible="false"
      data-active="false"
      data-theme="false"
      data-moving="false"
      aria-hidden="true"
    />
  );
}
