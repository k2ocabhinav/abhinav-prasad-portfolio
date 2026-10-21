"use client";

import { useMemo } from "react";
import { DoubleSide, ExtrudeGeometry, Shape } from "three";
import type { Part } from "./toon";
import { Toon } from "./toon";
import { ball, block, box, cord, peg, post } from "./partsKit";
import { toonRamp } from "./toonRamp";
import { FLOOR_CENTER_Z, FLOOR_DEPTH, FLOOR_WIDTH, WALL_HEIGHT, WALL_WIDTH, floorTexture, posterTexture, wallTexture } from "./textures";
import { roomPalette } from "../contracts";
import { noticeboard, noticeboardPoint } from "./roomAnchors";

const PAPER = roomPalette.paper;
const LEMON = roomPalette.lemon;
const BLUE = roomPalette.poolBlue;
const MINT = roomPalette.mint;
const TANGERINE = roomPalette.tangerine;
const LILAC = roomPalette.lilac;

const WINDOW_LEFT = -2.35;
const WINDOW_RIGHT = 2.05;
const WINDOW_BOTTOM = 2.15;
const WINDOW_TOP = 4.45;

function backWallGeometry(): ExtrudeGeometry {
  const bevel = 0.03;
  const w = WALL_WIDTH - bevel * 2;
  const h = WALL_HEIGHT - bevel * 2;
  const shape = new Shape();
  shape.moveTo(-w / 2, bevel);
  shape.lineTo(w / 2, bevel);
  shape.lineTo(w / 2, h + bevel);
  shape.lineTo(-w / 2, h + bevel);
  shape.closePath();
  const radius = 0.14;
  const left = WINDOW_LEFT - bevel;
  const right = WINDOW_RIGHT + bevel;
  const bottom = WINDOW_BOTTOM - bevel;
  const top = WINDOW_TOP + bevel;
  const hole = new Shape();
  hole.moveTo(left + radius, bottom);
  hole.lineTo(right - radius, bottom);
  hole.quadraticCurveTo(right, bottom, right, bottom + radius);
  hole.lineTo(right, top - radius);
  hole.quadraticCurveTo(right, top, right - radius, top);
  hole.lineTo(left + radius, top);
  hole.quadraticCurveTo(left, top, left, top - radius);
  hole.lineTo(left, bottom + radius);
  hole.quadraticCurveTo(left, bottom, left + radius, bottom);
  shape.holes.push(hole);
  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 1,
    curveSegments: 4,
  });
  geometry.translate(0, 0, -2.97 + bevel);
  return geometry;
}

function fairyStringParts(): Part[] {
  const parts: Part[] = [];
  const top = 5.27;
  const sag = 0.3;
  const swag = (from: [number, number], to: [number, number], axis: "x" | "z") => {
    const points = Array.from({ length: 9 }, (_, index) => {
      const t = index / 8;
      const along = from[0] + (to[0] - from[0]) * t;
      const y = top - sag * 4 * t * (1 - t);
      return axis === "x" ? ([along, y, from[1]] as [number, number, number]) : ([from[1], y, along] as [number, number, number]);
    });
    parts.push(cord(points, 0.011, roomPalette.ink, 14));
  };
  for (const [a, b] of [[-3.95, -1.3], [-1.3, 1.3], [1.3, 3.95]] as const) swag([a, -2.7], [b, -2.7], "x");
  for (const [a, b] of [[-2.7, -0.2], [-0.2, 2.3]] as const) swag([a, -3.97], [b, -3.97], "z");
  const nails: [number, number, number][] = [
    [-3.95, top, -2.7], [-1.3, top, -2.7], [1.3, top, -2.7], [3.95, top, -2.7],
    [-3.97, top, -0.2], [-3.97, top, 2.3],
  ];
  for (const nail of nails) parts.push(ball(0.03, nail, roomPalette.ink, { detail: 6, outline: false }));
  return parts;
}

/** Positions of the fairy-light bulbs along the same swags. */
export function fairyBulbPositions(): [number, number, number][] {
  const top = 5.27;
  const sag = 0.3;
  const result: [number, number, number][] = [];
  const count = 7;
  const swagPoints = (from: number, to: number, fixed: number, axis: "x" | "z") => {
    for (let index = 0; index < count; index += 1) {
      const t = (index + 0.5) / count;
      const along = from + (to - from) * t;
      const y = top - sag * 4 * t * (1 - t) - 0.07;
      result.push(axis === "x" ? [along, y, fixed] : [fixed, y, along]);
    }
  };
  for (const [a, b] of [[-3.95, -1.3], [-1.3, 1.3], [1.3, 3.95]] as const) swagPoints(a, b, -2.68, "x");
  for (const [a, b] of [[-2.7, -0.2], [-0.2, 2.3]] as const) swagPoints(a, b, -3.95, "z");
  return result;
}

function shellParts(): Part[] {
  const stand = "#E9602B";
  const parts: Part[] = [
    // Diorama base
    box([8.4, 0.3, FLOOR_DEPTH], [0, -0.15, FLOOR_CENTER_Z], stand, { radius: 0.05 }),
    box([8.95, 0.34, FLOOR_DEPTH + 0.55], [0, -0.47, FLOOR_CENTER_Z], "#8F78F2", { radius: 0.09 }),
    // Left wall and crown trims
    box([0.2, WALL_HEIGHT, 5.52], [-4.13, WALL_HEIGHT / 2, -0.21], LILAC, { radius: 0.04 }),
    box([8.5, 0.15, 0.36], [0, 5.47, -2.88], PAPER, { radius: 0.06 }),
    box([0.36, 0.15, 5.78], [-4.13, 5.47, -0.2], PAPER, { radius: 0.06 }),

    // Window frame, mullions, sill
    box([4.72, 0.17, 0.17], [-0.15, WINDOW_TOP + 0.07, -2.72], PAPER, { radius: 0.05 }),
    box([0.17, 2.52, 0.17], [WINDOW_LEFT - 0.07, 3.3, -2.72], PAPER, { radius: 0.05 }),
    box([0.17, 2.52, 0.17], [WINDOW_RIGHT + 0.07, 3.3, -2.72], PAPER, { radius: 0.05 }),
    box([0.1, 2.3, 0.1], [-0.15, 3.3, -2.74], PAPER, { radius: 0.03 }),
    box([4.4, 0.1, 0.1], [-0.15, 3.34, -2.74], PAPER, { radius: 0.03 }),
    box([5.0, 0.14, 0.44], [-0.15, 2.09, -2.6], LEMON, { radius: 0.06 }),

    // Curtain rod and finials
    post(0.03, 0.03, 5.0, [-2.8, 4.8, -2.6], roomPalette.ink, { rotation: [0, 0, -Math.PI / 2], segments: 6, outline: false }),
    ball(0.075, [-2.85, 4.8, -2.6], LEMON, { detail: 8 }),
    ball(0.075, [2.2, 4.8, -2.6], LEMON, { detail: 8 }),
    // Hanging shelf
    box([0.9, 0.14, 2.08], [-3.58, 4.12, -0.25], BLUE, { radius: 0.05 }),
    box([0.14, 0.34, 0.16], [-3.96, 3.88, -1.0], LEMON, { radius: 0.04 }),
    box([0.14, 0.34, 0.16], [-3.96, 3.88, 0.5], LEMON, { radius: 0.04 }),
    // Poster frame
    box([0.07, 1.44, 1.14], [-3.99, 3.3, 1.9], LEMON, { radius: 0.03 }),
    box([0.05, 1.28, 0.98], [-3.95, 3.3, 1.9], PAPER, { radius: 0.02, outline: false }),

    // Desk: slab, legs on the left, drawer unit on the right
    box([3.72, 0.2, 1.65], [0, 1.57, 0], BLUE, { radius: 0.08, bevel: 2 }),
    peg(0.13, 0.1, 1.47, [-1.62, 0, -0.55], "#2F82D8", 10),
    peg(0.13, 0.1, 1.47, [-1.62, 0, 0.55], "#2F82D8", 10),
    box([0.98, 1.34, 1.38], [1.34, 0.76, 0], "#5BB9FA", { radius: 0.06 }),
    block([0.84, 0.5, 0.05], [1.34, 1.08, 0.7], BLUE),
    block([0.84, 0.5, 0.05], [1.34, 0.46, 0.7], BLUE),
    ball(0.055, [1.34, 1.08, 0.75], LEMON, { detail: 8 }),
    ball(0.055, [1.34, 0.46, 0.75], LEMON, { detail: 8 }),
  ];
  return parts;
}

/**
 * The standing noticeboard: cork in a wooden frame on two legs, turned to face the
 * establishing camera. Its twelve slots (see roomAnchors) hold the polaroids.
 */
function noticeboardParts(): Part[] {
  const { center, yaw, width, height, columns, rows, pitchX, pitchY } = noticeboard;
  const frameWood = "#B9703F";
  const rotation: [number, number, number] = [0, yaw, 0];
  const bar = 0.13;
  const sideU = width / 2 + bar / 2;
  const bottomY = center[1] - height / 2 - bar;
  const parts: Part[] = [
    box([width, height, 0.07], noticeboardPoint(0, 0, 0), "#E8B27B", { radius: 0.02, rotation }),
    box([width + bar * 2, bar, 0.14], noticeboardPoint(0, height / 2 + bar / 2, 0.03), frameWood, { radius: 0.04, rotation }),
    box([width + bar * 2, bar, 0.14], noticeboardPoint(0, -height / 2 - bar / 2, 0.03), frameWood, { radius: 0.04, rotation }),
  ];
  for (const side of [-1, 1]) {
    parts.push(box([bar, height + bar * 2, 0.14], noticeboardPoint(side * sideU, 0, 0.03), frameWood, { radius: 0.04, rotation }));
    // Leg from the frame down to the floor, and a foot that runs front to back.
    parts.push(box([bar, bottomY, bar], noticeboardPoint(side * sideU, -center[1] + bottomY / 2, -0.02), frameWood, { radius: 0.04, rotation }));
    parts.push(box([0.15, 0.09, 0.86], noticeboardPoint(side * sideU, -center[1] + 0.045, -0.02), frameWood, { radius: 0.035, rotation }));
  }
  parts.push(box([width + bar, 0.09, 0.1], noticeboardPoint(0, -center[1] + bottomY * 0.45, -0.02), frameWood, { radius: 0.03, rotation }));

  // A pin per slot, hidden once a polaroid hangs there.
  const pinColors = [TANGERINE, BLUE, LEMON, MINT, LILAC];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const u = (column - (columns - 1) / 2) * pitchX;
      const v = ((rows - 1) / 2 - row) * pitchY + 0.2;
      parts.push(ball(0.04, noticeboardPoint(u, v, 0.06), pinColors[(row * columns + column) % pinColors.length], { detail: 7, outline: false }));
    }
  }
  return parts;
}

function bookParts(): Part[] {
  const parts: Part[] = [];
  const colors = [TANGERINE, MINT, LEMON, LILAC, BLUE, PAPER, TANGERINE, MINT];
  const widths = [0.1, 0.08, 0.12, 0.09, 0.11, 0.08, 0.1, 0.12];
  const heights = [0.46, 0.38, 0.5, 0.42, 0.36, 0.48, 0.4, 0.44];
  let z = -1.22;
  widths.forEach((width, index) => {
    z += width / 2;
    parts.push(block([0.32, heights[index], width], [-3.86, 4.19 + heights[index] / 2, z], colors[index]));
    z += width / 2 + 0.01;
  });
  // A couple leaning at the end, then a succulent.
  parts.push(block([0.3, 0.44, 0.09], [-3.85, 4.19 + 0.2, z + 0.1], BLUE, [0.32, 0, 0]));
  parts.push(block([0.3, 0.4, 0.09], [-3.85, 4.19 + 0.18, z + 0.2], LEMON, [0.32, 0, 0]));
  parts.push(post(0.1, 0.12, 0.17, [-3.76, 4.19, 0.64], TANGERINE, { round: 0.03 }));
  parts.push(ball(0.12, [-3.76, 4.4, 0.64], MINT, { scale: [1, 0.8, 1], detail: 9 }));
  parts.push(ball(0.07, [-3.7, 4.5, 0.7], "#5CD2A0", { detail: 8 }));
  return parts;
}

function curtainParts(): Part[] {
  const parts: Part[] = [];
  const light = MINT;
  const dark = "#5CD0A0";
  const folds = (xs: number[]) =>
    xs.forEach((x, index) => {
      parts.push(post(0.085, 0.1, 2.5, [x, 2.2, index % 2 === 0 ? -2.6 : -2.66], index % 2 === 0 ? light : dark, { round: 0.045, segments: 7 }));
    });
  folds([-2.66, -2.52, -2.38]);
  folds([1.98, 2.12, 2.26]);
  // Tie-backs
  parts.push(box([0.5, 0.08, 0.2], [-2.52, 3.15, -2.5], LEMON, { radius: 0.035 }));
  parts.push(box([0.46, 0.08, 0.2], [2.12, 3.15, -2.5], LEMON, { radius: 0.035 }));
  return parts;
}

export function RoomShell() {
  const wallGeometry = useMemo(() => backWallGeometry(), []);
  const shell = useMemo<Part[]>(
    () => [
      ...shellParts(),
      { geometry: wallGeometry, color: LILAC },
      ...noticeboardParts(),
      ...bookParts(),
      ...curtainParts(),
      ...fairyStringParts(),
    ],
    [wallGeometry],
  );
  const floor = useMemo(() => floorTexture(), []);
  const backWall = useMemo(() => wallTexture("back"), []);
  const sideWall = useMemo(() => wallTexture("side"), []);
  const poster = useMemo(() => posterTexture(), []);

  return (
    <group>
      <Toon parts={shell} />
      <mesh position={[0, 0.004, FLOOR_CENTER_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[FLOOR_WIDTH, FLOOR_DEPTH]} />
        <meshToonMaterial map={floor} gradientMap={toonRamp} />
      </mesh>
      <mesh position={[0, WALL_HEIGHT / 2, -2.768]}>
        <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT]} />
        <meshToonMaterial map={backWall} gradientMap={toonRamp} alphaTest={0.5} />
      </mesh>
      <mesh position={[-4.028, WALL_HEIGHT / 2, FLOOR_CENTER_Z]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[FLOOR_DEPTH, WALL_HEIGHT]} />
        <meshToonMaterial map={sideWall} gradientMap={toonRamp} />
      </mesh>
      <mesh position={[-3.915, 3.3, 1.9]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 1.2]} />
        <meshToonMaterial map={poster} gradientMap={toonRamp} side={DoubleSide} />
      </mesh>
    </group>
  );
}
