"use client";

import { useEffect } from "react";

export default function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "1";
  }, []);

  return null;
}
