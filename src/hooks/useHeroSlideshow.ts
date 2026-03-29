"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { HeroSlide } from "@/types";

// =============================================================================
// useHeroSlideshow — Auto-cycling slideshow with crossfade support
// Respects prefers-reduced-motion via the autoPlay prop.
// =============================================================================

interface UseHeroSlideshowOptions {
  slides: HeroSlide[];
  interval?: number;
  crossfadeDuration?: number;
  autoPlay?: boolean;
}

interface UseHeroSlideshowReturn {
  currentSlide: number;
  nextSlide: number;
  isTransitioning: boolean;
  goToSlide: (index: number) => void;
}

export function useHeroSlideshow({
  slides,
  interval = 4000,
  crossfadeDuration = 1000,
  autoPlay = true,
}: UseHeroSlideshowOptions): UseHeroSlideshowReturn {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = (currentSlide + 1) % slides.length;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      clearTimer();
      setIsTransitioning(true);
      setCurrentSlide(index);

      setTimeout(() => {
        setIsTransitioning(false);
      }, crossfadeDuration);
    },
    [clearTimer, crossfadeDuration]
  );

  const advance = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, goToSlide, slides.length]);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      advance();
    }, interval);

    return clearTimer;
  }, [autoPlay, slides.length, interval, advance, clearTimer]);

  return {
    currentSlide,
    nextSlide,
    isTransitioning,
    goToSlide,
  };
}
