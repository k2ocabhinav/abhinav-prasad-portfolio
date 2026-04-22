"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent);
}

export function useIsFirefox(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
