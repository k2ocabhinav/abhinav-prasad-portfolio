"use client";

import { useSyncExternalStore } from "react";

// =============================================================================
// useFinePointer — true when the primary pointer is a mouse or trackpad.
// Touch-first devices (phones, tablets) report a coarse pointer.
// =============================================================================

const FINE_POINTER_QUERY = "(pointer: fine)";

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia(FINE_POINTER_QUERY);

  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

export function useFinePointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
