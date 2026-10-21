"use client";

import { createContext, useContext } from "react";

export interface NightBlendStore {
  get: () => number;
  set: (value: number) => void;
}

let value = 0;

export const roomNightBlend: NightBlendStore = {
  get: () => value,
  set: (next) => { value = next; },
};

export const NightBlendContext = createContext<NightBlendStore>(roomNightBlend);

export function useNightBlend(): NightBlendStore {
  return useContext(NightBlendContext);
}
