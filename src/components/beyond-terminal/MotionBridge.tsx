"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function MotionBridge() {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const root = document.querySelector("[data-beyond-landing]");

    if (!(root instanceof HTMLElement)) {
      return;
    }

    root.dataset.motionMode = prefersReducedMotion ? "reduced" : "active";

    const shouldUseNativeScroll =
      prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches;

    let lenis: Lenis | null = null;
    let ticker: ((time: number) => void) | null = null;

    if (!shouldUseNativeScroll) {
      lenis = new Lenis({
        lerp: 0.09,
        duration: 1.1,
        autoRaf: false,
        smoothWheel: true,
        syncTouch: false,
      });

      const updateScrollTrigger = () => ScrollTrigger.update();
      lenis.on("scroll", updateScrollTrigger);

      ticker = (time: number) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);
    }

    const context = gsap.context(() => {
      const revealItems = gsap.utils.toArray<HTMLElement>("[data-beyond-reveal]");

      revealItems.forEach((item, index) => {
        gsap.fromTo(
          item,
          { y: prefersReducedMotion ? 0 : 36, opacity: prefersReducedMotion ? 1 : 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.88,
            delay: index * 0.03,
            ease: "power3.out",
            scrollTrigger: prefersReducedMotion
              ? undefined
              : {
                  trigger: item,
                  start: "top 86%",
                  once: true,
                },
          }
        );
      });

      if (prefersReducedMotion || window.innerWidth < 960) {
        return;
      }

      const bands = gsap.utils.toArray<HTMLElement>("[data-beyond-band]");

      bands.forEach((band) => {
        const media = band.querySelector<HTMLElement>("[data-card-media]");
        const copyNodes = gsap.utils.toArray<HTMLElement>("[data-card-copy]", band);
        const isReverse = band.dataset.layout === "wide_strip_reverse";

        if (media) {
          gsap.fromTo(
            media,
            { x: isReverse ? -18 : 18, y: 22, opacity: 0.86 },
            {
              x: 0,
              y: 0,
              opacity: 1,
              duration: 0.92,
              ease: "power3.out",
              scrollTrigger: {
                trigger: band,
                start: "top 84%",
                once: true,
              },
            }
          );

          gsap.fromTo(
            media,
            { y: 26, scale: 0.98 },
            {
              y: -18,
              scale: 1.01,
              ease: "none",
              scrollTrigger: {
                trigger: band,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            }
          );
        }

        copyNodes.forEach((node, index) => {
          gsap.fromTo(
            node,
            { x: isReverse ? 14 : -14 },
            {
              x: isReverse ? 8 : -8,
              ease: "none",
              scrollTrigger: {
                trigger: band,
                start: "top bottom",
                end: "bottom top",
                scrub: 1 + index * 0.08,
              },
            }
          );
        });
      });

      const statement = root.querySelector<HTMLElement>("[data-signal-statement]");
      const visual = root.querySelector<HTMLElement>("[data-signal-visual]");

      if (statement) {
        gsap.fromTo(
          statement,
          { y: 0 },
          {
            y: -20,
            ease: "none",
            scrollTrigger: {
              trigger: statement,
              start: "top 78%",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      }

      if (visual) {
        gsap.fromTo(
          visual,
          { y: 18 },
          {
            y: -14,
            ease: "none",
            scrollTrigger: {
              trigger: visual,
              start: "top 80%",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      }
    }, root);

    return () => {
      context.revert();

      if (ticker) {
        gsap.ticker.remove(ticker);
      }

      lenis?.destroy();
    };
  }, [prefersReducedMotion]);

  return null;
}
