"use client";

import { useEffect } from "react";
import { SKY_ICONS, SKY_PHASES, type Phase } from "@/lib/skyIcons.generated";

function getPhase(date: Date): Phase {
  const minuteOfDay = date.getHours() * 60 + date.getMinutes();
  const phase = SKY_PHASES.find(({ start, end }) =>
    start < end
      ? minuteOfDay >= start && minuteOfDay < end
      : minuteOfDay >= start || minuteOfDay < end
  );

  return phase?.phase ?? "night";
}

export default function SkyFavicon() {
  useEffect(() => {
    const selector = 'link[rel~="icon"]';
    let currentPhase: Phase | null = null;
    const apply = (phase: Phase) => {
      document.querySelectorAll<HTMLLinkElement>(selector).forEach((icon) => {
        if (icon.getAttribute("href") !== SKY_ICONS[phase]) {
          icon.setAttribute("href", SKY_ICONS[phase]);
        }
        if (icon.getAttribute("type") !== "image/svg+xml") {
          icon.setAttribute("type", "image/svg+xml");
        }
      });
    };
    const update = () => {
      const phase = getPhase(new Date());
      if (phase === currentPhase) return;
      currentPhase = phase;
      apply(phase);
    };

    update();
    const observer = new MutationObserver(() => {
      if (currentPhase) apply(currentPhase);
    });
    observer.observe(document.head, { childList: true, subtree: true });
    const interval = window.setInterval(update, 5 * 60 * 1000);
    document.addEventListener("visibilitychange", update);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
      observer.disconnect();
    };
  }, []);

  return null;
}
