"use client";

import { useEffect, useRef } from "react";

export default function InkPassController() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const shell = markerRef.current?.closest("h1");
    const plate = shell?.querySelector<HTMLElement>("[data-ink-plate-drift='true']");
    if (!shell || !plate) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    shell.dataset.reduceMotion = reducedMotion.matches ? "true" : "false";
    if (reducedMotion.matches) return;

    let passFrame = 0;
    let secondPassFrame = 0;
    passFrame = window.requestAnimationFrame(() => {
      secondPassFrame = window.requestAnimationFrame(() => {
        shell.dataset.pass = "true";
      });
    });

    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) {
      return () => {
        window.cancelAnimationFrame(passFrame);
        if (secondPassFrame !== 0) window.cancelAnimationFrame(secondPassFrame);
      };
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;

    const animate = () => {
      frame = 0;
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      plate.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

      if (Math.abs(targetX - currentX) > 0.08 || Math.abs(targetY - currentY) > 0.08) {
        frame = window.requestAnimationFrame(animate);
      } else {
        currentX = targetX;
        currentY = targetY;
        plate.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      }
    };

    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = Math.max(-5, Math.min(5, ((event.clientX / window.innerWidth) - 0.5) * 10));
      targetY = Math.max(-5, Math.min(5, ((event.clientY / window.innerHeight) - 0.5) * 10));
      schedule();
    };

    const returnToRest = () => {
      targetX = 0;
      targetY = 0;
      schedule();
    };

    const handlePointerLeave = (event: PointerEvent) => {
      if (event.relatedTarget === null) returnToRest();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerLeave, { passive: true });
    window.addEventListener("blur", returnToRest);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerLeave);
      window.removeEventListener("blur", returnToRest);
      window.cancelAnimationFrame(passFrame);
      if (secondPassFrame !== 0) window.cancelAnimationFrame(secondPassFrame);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <span ref={markerRef} hidden aria-hidden="true" />;
}
