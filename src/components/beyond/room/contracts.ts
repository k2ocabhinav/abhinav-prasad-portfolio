// Shared contracts for the Beyond 3D room. Three tracks build against these
// in parallel: scene (room, light, camera), moments (objects, postcard,
// accessible list) and shell (route, loading, arrival, fallback).
import { createContext, useContext } from "react";
import type { BeyondAlbumKind } from "@/types";

export type Vec3 = [number, number, number];

/** Where a moment object can be placed in the room. */
export type RoomAnchorKind = "frame" | "corkboard" | "desk" | "shelf" | "laptop-lid" | "shoebox";

export interface RoomAnchor {
  id: string;
  kind: RoomAnchorKind;
  position: Vec3;
  rotation: Vec3;
  /** Largest width and height (world units) an object may occupy here. */
  maxSize: [number, number];
}

/** Preferred anchor kinds per object, in order of preference. */
export const anchorPreference: Record<BeyondAlbumKind, RoomAnchorKind[]> = {
  photo: ["frame", "corkboard", "desk", "shelf"],
  person: ["corkboard", "shelf"],
  quote: ["corkboard", "desk"],
  event: ["corkboard", "desk"],
  project: ["laptop-lid", "corkboard"],
};

export type RoomMode = "day" | "night";

export interface CameraRig {
  /** Glide the camera to frame a world-space target, facing along its normal. */
  focus: (target: { position: Vec3; normal: Vec3; size: [number, number] }) => void;
  /** Return to the establishing shot. */
  reset: () => void;
}

/** Provided by the scene track, consumed by the moments track. */
export const RoomAnchorsContext = createContext<RoomAnchor[]>([]);
export const CameraRigContext = createContext<CameraRig | null>(null);
/** The door sign: leaves the room for the home page. Provided by the canvas wrapper. */
export const RoomExitContext = createContext<() => void>(() => {});

export function useRoomAnchors(): RoomAnchor[] {
  return useContext(RoomAnchorsContext);
}

export function useCameraRig(): CameraRig | null {
  return useContext(CameraRigContext);
}

/** The palette for the room, distinct from the main site's print palette. */
export const roomPalette = {
  tangerine: "#FF7A3D",
  poolBlue: "#3FA9F5",
  lemon: "#FFE05A",
  lilac: "#B9A3FF",
  mint: "#7EE0B5",
  ink: "#16131A",
  paper: "#FFF8EC",
  night: "#1B1838",
} as const;
