import type { RoomAnchor, Vec3 } from "../contracts";

/**
 * The noticeboard stands on the floor to the left of the desk and is turned to face
 * the establishing camera, so every slot reads head-on. Shared with the room shell,
 * which builds the board around the same numbers.
 */
export const noticeboard = {
  center: [-3.0, 2.55, -0.75] as Vec3,
  yaw: 0.62,
  width: 1.85,
  height: 1.7,
  columns: 4,
  rows: 3,
  pitchX: 0.44,
  pitchY: 0.56,
  /** Distance of a slot's centre from the cork plane. */
  lift: 0.09,
};

/** A point on the noticeboard: `u` along its width, `v` up, `w` out of the cork. */
export function noticeboardPoint(u: number, v: number, w = 0): Vec3 {
  const { center, yaw } = noticeboard;
  return [
    center[0] + u * Math.cos(yaw) + w * Math.sin(yaw),
    center[1] + v,
    center[2] - u * Math.sin(yaw) + w * Math.cos(yaw),
  ];
}

const frame: RoomAnchor[] = [
  {
    id: "frame-1",
    kind: "frame",
    // The wall print above the plant. Its outer size is the old poster frame.
    position: [-3.93, 3.3, 1.9],
    rotation: [0, Math.PI / 2, 0],
    maxSize: [1.14, 1.44],
  },
];

const corkboard: RoomAnchor[] = Array.from({ length: noticeboard.columns * noticeboard.rows }, (_, index) => {
  const column = index % noticeboard.columns;
  const row = Math.floor(index / noticeboard.columns);
  const u = (column - (noticeboard.columns - 1) / 2) * noticeboard.pitchX;
  const v = ((noticeboard.rows - 1) / 2 - row) * noticeboard.pitchY;
  return {
    id: `corkboard-${index + 1}`,
    kind: "corkboard",
    position: noticeboardPoint(u, v, noticeboard.lift),
    rotation: [0, noticeboard.yaw, (column % 2 === 0 ? 1 : -1) * 0.025],
    maxSize: [0.4, 0.5],
  };
});

const shoebox: RoomAnchor[] = [
  {
    id: "shoebox-1",
    kind: "shoebox",
    // On the floor between the plant and the desk, turned towards the camera.
    position: [-2.45, 0.22, 0.6],
    rotation: [0, 0.62, 0],
    maxSize: [0.7, 0.42],
  },
];

const desk: RoomAnchor[] = Array.from({ length: 6 }, (_, index) => ({
  id: `desk-${index + 1}`,
  kind: "desk",
  // Standing on the desk edge, leaning back a little.
  position: [-1.38 + index * 0.55, 1.9, 0.53],
  rotation: [-0.2, 0, (index % 2 === 0 ? 1 : -1) * 0.018],
  maxSize: [0.45, 0.46],
}));

const shelf: RoomAnchor[] = Array.from({ length: 4 }, (_, index) => ({
  id: `shelf-${index + 1}`,
  kind: "shelf",
  position: [-3.29, 4.24, 0.28 - index * 0.46],
  rotation: [0, Math.PI / 2, 0],
  maxSize: [0.38, 0.42],
}));

const laptop: RoomAnchor[] = Array.from({ length: 4 }, (_, index) => {
  const column = index % 2;
  const row = Math.floor(index / 2);
  return {
    id: `laptop-lid-${index + 1}`,
    kind: "laptop-lid",
    position: [-0.42 + column * 0.84, 2.19 + row * 0.33, -0.53],
    rotation: [-0.15, 0, 0],
    maxSize: [0.32, 0.27],
  };
});

export const roomAnchors: RoomAnchor[] = [...frame, ...corkboard, ...desk, ...shelf, ...laptop, ...shoebox];
