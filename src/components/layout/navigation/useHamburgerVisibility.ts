import { useCallback, useEffect, useState } from "react";

export function useHamburgerVisibility(isMobileMenuOpen: boolean) {
  const [isHamburgerHidden, setIsHamburgerHidden] = useState(false);

  const revealHamburger = useCallback(() => {
    setIsHamburgerHidden(false);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      return;
    }

    let lastY = window.scrollY;
    let maxScroll = 0;

    // Cache the scroll range; only resize and content-height changes refresh
    // it. The scroll handler then does no layout reads.
    const measure = () => {
      maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);
    window.addEventListener("resize", measure, { passive: true });

    // Runs in the scroll event itself (one per frame), so the scrollY read
    // never lands after the frame's style writes and forces a recalculation.
    const handleScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < 4) {
        return;
      }
      lastY = y;

      const atEdge = y <= 96 || maxScroll - y <= 96;
      setIsHamburgerHidden(!atEdge && delta > 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", measure);
      resizeObserver.disconnect();
    };
  }, [isMobileMenuOpen]);

  return { isHamburgerHidden, revealHamburger };
}
