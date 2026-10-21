"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Euler, Vector3 } from "three";
import type { Group } from "three";
import type { BeyondAlbumItem } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { roomStore, useRoomState } from "../roomStore";
import {
  anchorPreference,
  useCameraRig,
  useRoomAnchors,
  type CameraRig,
  type RoomAnchor,
  type Vec3,
} from "../contracts";
import { FOCUS_MOMENT_EVENT } from "./events";
import {
  EventTicket,
  MomentNameTab,
  MomentPhoto,
  PlateBody,
  ProjectSticker,
  Shoebox,
  StickyNote,
} from "./MomentArtwork";

interface BeyondRoomProps {
  items: BeyondAlbumItem[];
}

interface Placement {
  item: BeyondAlbumItem;
  anchor: RoomAnchor;
  tilt: Vec3;
  width: number;
  height: number;
}

const objectSize = {
  photo: [0.82, 1.08],
  quote: [0.9, 0.9],
  event: [1.18, 0.64],
  person: [0.82, 1.08],
  project: [0.72, 0.66],
} satisfies Record<BeyondAlbumItem["kind"], [number, number]>;

function hashTilt(id: string): Vec3 {
  let seed = 0;
  for (const character of id) seed = (seed * 31 + character.charCodeAt(0)) | 0;
  const unit = (offset: number) => {
    const value = Math.sin(seed + offset * 91.17) * 43758.5453;
    return (value - Math.floor(value) - 0.5) * 0.12;
  };
  return [unit(1), unit(2), unit(3)];
}

function makePlacements(items: BeyondAlbumItem[], anchors: RoomAnchor[]): Placement[] {
  const unused = new Set(anchors);
  const placements: Placement[] = [];

  for (const item of items) {
    const preferred = anchorPreference[item.kind];
    const anchor = preferred
      .map((kind) => Array.from(unused).find((candidate) => candidate.kind === kind))
      .find((candidate): candidate is RoomAnchor => Boolean(candidate));

    if (!anchor) continue;
    unused.delete(anchor);

    const [baseWidth, baseHeight] = objectSize[item.kind];
    const scale = Math.min(anchor.maxSize[0] / baseWidth, anchor.maxSize[1] / baseHeight, 1);
    placements.push({
      item,
      anchor,
      tilt: hashTilt(item.id),
      width: baseWidth * scale,
      height: baseHeight * scale,
    });
  }

  return placements;
}

function focusPlacement(rig: CameraRig | null, placement: Placement | undefined): void {
  if (!rig || !placement) return;
  const normal = new Vector3(0, 0, 1).applyEuler(new Euler(...placement.anchor.rotation));
  rig.focus({
    position: placement.anchor.position,
    normal: [normal.x, normal.y, normal.z],
    size: [placement.width, placement.height],
  });
}

function MomentObject({ placement }: { placement: Placement }) {
  const { item, anchor, tilt, width, height } = placement;
  const objectRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  const invalidate = useThree((state) => state.invalidate);
  const roomState = useRoomState();
  const focused = roomState.focus?.type === "moment" && roomState.focus.id === item.id;
  const imageKind = item.kind === "photo" || item.kind === "person";
  const objectWidth = imageKind ? width - 0.08 : width;
  const objectHeight = imageKind ? height - 0.08 : height;
  const spring = useRef({ position: 0, velocity: 0 });
  const outlineThickness = hovered || focused ? 0.05 : 0.018;

  useFrame((_, frameDelta) => {
    const group = objectRef.current;
    if (!group) return;

    if (reduceMotion) {
      spring.current.position = 0;
      spring.current.velocity = 0;
      group.scale.set(1, 1, 1);
      group.rotation.z = tilt[2];
      return;
    }

    const delta = Math.min(frameDelta, 0.05);
    const target = hovered || focused ? 1 : 0;
    const state = spring.current;
    const acceleration = (target - state.position) * 180 - state.velocity * 24;
    state.velocity += acceleration * delta;
    state.position += state.velocity * delta;

    group.scale.set(
      1 + state.position * 0.05,
      1 - state.position * 0.025,
      1 + state.position * 0.04
    );
    group.rotation.z = tilt[2] + state.position * 0.04;

    if (Math.abs(target - state.position) > 0.001 || Math.abs(state.velocity) > 0.01) {
      invalidate();
    }
  });

  const activate = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    roomStore.set({ focus: { type: "moment", id: item.id } });
  };

  return (
    <group position={anchor.position} rotation={anchor.rotation}>
      <group
        ref={objectRef}
        rotation={tilt}
        onClick={activate}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
          invalidate();
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "";
          invalidate();
        }}
      >
        {imageKind ? (
          <>
            <PlateBody
              width={objectWidth}
              height={objectHeight}
              color="#FFF8EC"
              outlineThickness={outlineThickness}
            />
            <MomentPhoto
              item={item}
              width={objectWidth}
              height={objectHeight}
              showCaption={item.kind !== "person"}
            />
            {item.kind === "person" ? <MomentNameTab item={item} width={objectWidth} /> : null}
          </>
        ) : item.kind === "quote" ? (
          <StickyNote item={item} width={width} height={height} outlineThickness={outlineThickness} />
        ) : item.kind === "event" ? (
          <EventTicket item={item} width={width} height={height} outlineThickness={outlineThickness} />
        ) : (
          <ProjectSticker item={item} width={width} height={height} outlineThickness={outlineThickness} />
        )}
      </group>
    </group>
  );
}

export default function MomentsLayer({ items }: BeyondRoomProps) {
  const anchors = useRoomAnchors();
  const cameraRig = useCameraRig();
  const roomState = useRoomState();
  const placements = useMemo(() => makePlacements(items, anchors), [anchors, items]);
  const previouslyFocused = useRef<string | null>(null);
  const placedAnchorIds = useMemo(
    () => new Set(placements.map((placement) => placement.anchor.id)),
    [placements]
  );
  const overflow = items.filter(
    (item) => !placements.some((placement) => placement.item.id === item.id)
  );
  const spareShelf = anchors.find(
    (anchor) => anchor.kind === "shelf" && !placedAnchorIds.has(anchor.id)
  );

  useEffect(() => {
    const focusMoment = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      const placement = placements.find((candidate) => candidate.item.id === detail?.id);
      focusPlacement(cameraRig, placement);
    };
    window.addEventListener(FOCUS_MOMENT_EVENT, focusMoment);
    return () => window.removeEventListener(FOCUS_MOMENT_EVENT, focusMoment);
  }, [cameraRig, placements]);

  useEffect(() => {
    const current = roomState.focus?.type === "moment" ? roomState.focus.id : null;
    if (current) {
      focusPlacement(cameraRig, placements.find((placement) => placement.item.id === current));
    } else if (previouslyFocused.current) {
      cameraRig?.reset();
    }
    previouslyFocused.current = current;
  }, [cameraRig, placements, roomState.focus]);

  return (
    <>
      {placements.map((placement) => (
        <Suspense fallback={null} key={placement.item.id}>
          <MomentObject placement={placement} />
        </Suspense>
      ))}
      {overflow.length ? <Shoebox anchor={spareShelf} count={overflow.length} /> : null}
    </>
  );
}
