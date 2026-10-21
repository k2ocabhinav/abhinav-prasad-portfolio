import { useEffect, useState } from "react";

export function useMarqueeRailTracking(): boolean {
  const [isMarqueeUnderRail, setIsMarqueeUnderRail] = useState(false);

  useEffect(() => {
    const marquee = document.querySelector<HTMLElement>('[data-marquee="true"]');
    if (!marquee) {
      return;
    }

    let observer: IntersectionObserver | undefined;
    const observeCenterBand = () => {
      observer?.disconnect();
      const inset = Math.round(window.innerHeight * 0.45);
      observer = new IntersectionObserver(
        (entries) => setIsMarqueeUnderRail(Boolean(entries[0]?.isIntersecting)),
        { rootMargin: `-${inset}px 0px -${inset}px 0px`, threshold: 0 }
      );
      observer.observe(marquee);
    };

    observeCenterBand();
    window.addEventListener("resize", observeCenterBand, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observeCenterBand);
    };
  }, []);

  return isMarqueeUnderRail;
}
