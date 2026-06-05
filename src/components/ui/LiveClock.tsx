"use client";

import { useEffect, useState } from "react";
import styles from "./LiveClock.module.css";

// =============================================================================
// LiveClock — Ticking clock showing current time in a specific timezone
// =============================================================================

interface LiveClockProps {
  city: string;
  countryCode: string;
  timezone: string;
}

export default function LiveClock({ city, countryCode, timezone }: LiveClockProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const initialId = window.setTimeout(() => setTime(new Date()), 0);
    const intervalId = window.setInterval(() => setTime(new Date()), 1000);

    return () => {
      window.clearTimeout(initialId);
      window.clearInterval(intervalId);
    };
  }, []);

  const formatted =
    time?.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: timezone,
      hour12: false,
    }) ?? "--:--:--";

  return (
    <span className={styles.clock}>
      {city}, {countryCode} — {formatted} IST
    </span>
  );
}
