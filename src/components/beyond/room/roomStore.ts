// A tiny external store shared by the canvas, the DOM overlays and the shell.
// Kept dependency-free on purpose.
import { useSyncExternalStore } from "react";
import type { RoomMode } from "./contracts";

export type RoomFocus = { type: "moment"; id: string } | { type: "laptop" } | null;

interface RoomState {
  focus: RoomFocus;
  mode: RoomMode;
  soundOn: boolean;
  arrived: boolean;
}

let state: RoomState = { focus: null, mode: "day", soundOn: false, arrived: false };
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export const roomStore = {
  get: () => state,
  set(patch: Partial<RoomState>) {
    state = { ...state, ...patch };
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

const serverState: RoomState = { focus: null, mode: "day", soundOn: false, arrived: false };

export function useRoomState(): RoomState {
  return useSyncExternalStore(roomStore.subscribe, roomStore.get, () => serverState);
}
