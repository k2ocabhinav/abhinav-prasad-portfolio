"use client";

import { useEffect, useState } from "react";

interface LocalTimeProps {
  city: string;
}

function formatMumbaiTime() {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date());
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;
  const period = parts.find((part) => part.type === "dayPeriod")?.value.toLowerCase();

  return hour && minute && period ? `${hour}:${minute} ${period}` : "";
}

export default function LocalTime({ city }: LocalTimeProps) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: number | null = null;

    const clearTimer = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const updateAndSchedule = () => {
      clearTimer();
      if (document.visibilityState !== "visible") return;

      setTime(formatMumbaiTime());
      const untilNextMinute = 60_000 - (Date.now() % 60_000);
      timeoutId = window.setTimeout(updateAndSchedule, untilNextMinute);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateAndSchedule();
      } else {
        clearTimer();
      }
    };

    updateAndSchedule();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <span data-local-time="true">
      {time ? ` · It's ${time} in ${city}` : " (IST)"}
    </span>
  );
}
