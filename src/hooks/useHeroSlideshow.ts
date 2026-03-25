"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface HeroSlide {
  image: string;
  alt: string;
}

interface UseHeroSlideshowOptions {
  slides: HeroSlide[];
  interval?: number;
  crossfadeDuration?: number;
  autoPlay?: boolean;
}

interface UseHeroSlideshowReturn {
  currentSlide: number;
  nextSlide: number;
  progress: number;
  isTransitioning: boolean;
}

export function useHeroSlideshow({
  slides,
  interval = 4000,
  crossfadeDuration = 1000,
  autoPlay = true,
}: UseHeroSlideshowOptions): UseHeroSlideshowReturn {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = (currentSlide + 1) % slides.length;

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      clearTimers();
      setIsTransitioning(true);
      setCurrentSlide(index);
      setProgress(0);

      setTimeout(() => {
        setIsTransitioning(false);
      }, crossfadeDuration);
    },
    [clearTimers, crossfadeDuration]
  );

  const advance = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, goToSlide, slides.length]);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) {
      clearTimers();
      return;
    }

    // Progress tracker
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (interval - crossfadeDuration)) * 100;
      });
    }, 100);

    // Slide advancement
    intervalRef.current = setInterval(() => {
      advance();
    }, interval);

    return clearTimers;
  }, [autoPlay, slides.length, interval, crossfadeDuration, advance, clearTimers]);

  return {
    currentSlide,
    nextSlide,
    progress,
    isTransitioning,
  };
}
