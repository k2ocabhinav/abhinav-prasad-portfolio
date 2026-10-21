import type { RoomAnchor } from "../contracts";

const corkboard: RoomAnchor[] = Array.from({ length: 12 }, (_, index) => {
  const column = index % 4;
  const row = Math.floor(index / 4);
  return {
    id: `corkboard-${index + 1}`,
    kind: "corkboard",
    position: [-3.83 + column * 0.35, 3.7 - row * 0.45, -2.4],
    rotation: [0, 0, (column % 2 === 0 ? 1 : -1) * 0.025],
    maxSize: [0.31, 0.41],
  };
});

const desk: RoomAnchor[] = Array.from({ length: 6 }, (_, index) => ({
  id: `desk-${index + 1}`,
  kind: "desk",
  position: [-1.38 + index * 0.55, 1.68, 0.53],
  rotation: [0, 0, (index % 2 === 0 ? 1 : -1) * 0.018],
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

export const roomAnchors: RoomAnchor[] = [...corkboard, ...desk, ...shelf, ...laptop];
