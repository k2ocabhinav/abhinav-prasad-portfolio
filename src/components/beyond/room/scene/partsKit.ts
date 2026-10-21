import {
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  Euler,
  ExtrudeGeometry,
  Quaternion,
  Shape,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import type { Vec3 } from "../contracts";
import type { Part } from "./toon";
import { pill, roundedBox } from "./toon";

/** A rounded box part; `at` is its centre. */
export function box(
  size: Vec3,
  at: Vec3,
  color: string,
  options: { radius?: number; bevel?: number; rotation?: Vec3; outline?: boolean } = {},
): Part {
  return {
    geometry: roundedBox(size[0], size[1], size[2], options.radius ?? 0.05, options.bevel ?? 1),
    position: at,
    rotation: options.rotation,
    color,
    outline: options.outline,
  };
}

/** A plain flat-faced box for tiny details (12 triangles, no outline). */
export function slab(size: Vec3, at: Vec3, color: string): Part {
  return { geometry: new BoxGeometry(size[0], size[1], size[2]), position: at, color, outline: false };
}

/** A sharp-edged box that still carries the ink outline (12 triangles). */
export function block(size: Vec3, at: Vec3, color: string, rotation?: Vec3): Part {
  return { geometry: new BoxGeometry(size[0], size[1], size[2]), position: at, rotation, color, outline: true };
}

/** A low-poly tapered leg standing on `at`. */
export function peg(radiusBottom: number, radiusTop: number, height: number, at: Vec3, color: string, segments = 8): Part {
  const geometry = new CylinderGeometry(radiusTop, radiusBottom, height, segments, 1);
  geometry.translate(0, height / 2, 0);
  return { geometry, position: at, color, outline: true };
}

/** A chunky cylinder standing on `at` (its base centre). */
export function post(
  radiusBottom: number,
  radiusTop: number,
  height: number,
  at: Vec3,
  color: string,
  options: { round?: number; rotation?: Vec3; outline?: boolean; segments?: number } = {},
): Part {
  return {
    geometry: pill(radiusBottom, radiusTop, height, options.round ?? 0.03, options.segments ?? 12),
    position: at,
    rotation: options.rotation,
    color,
    outline: options.outline,
  };
}

export function ball(radius: number, at: Vec3, color: string, options: { scale?: Vec3; outline?: boolean; detail?: number } = {}): Part {
  const detail = options.detail ?? 10;
  return {
    geometry: new SphereGeometry(radius, detail, Math.max(5, Math.round(detail * 0.7))),
    position: at,
    scale: options.scale,
    color,
    outline: options.outline,
  };
}

/** Euler angles that turn +Y towards `to` from `from`. */
export function aim(from: Vec3, to: Vec3): Euler {
  const direction = new Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]).normalize();
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction);
  return new Euler().setFromQuaternion(quaternion);
}

/** A thin tapered rod between two points. */
export function rod(from: Vec3, to: Vec3, radius: number, color: string, outline = false): Part {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const rotation = aim(from, to);
  return {
    geometry: new CylinderGeometry(radius * 0.8, radius, length, 5, 1),
    position: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2],
    rotation: [rotation.x, rotation.y, rotation.z],
    color,
    outline,
  };
}

/** A string through points, as a thin tube. */
export function cord(points: Vec3[], radius: number, color: string, segments = 24): Part {
  const curve = new CatmullRomCurve3(points.map((point) => new Vector3(...point)));
  return { geometry: new TubeGeometry(curve, segments, radius, 3, false), color, outline: false };
}

/** The plant: a monstera-style leaf, cleft at the stalk, slit along the sides. Base at the origin, tip along +Y. */
export function monsteraLeaf(width: number, height: number): BufferGeometry {
  const points: [number, number][] = [];
  const total = 34;
  const centreY = (height * 9) / 22;
  const slits = [25, 55, 125, 155].map((degrees) => (degrees * Math.PI) / 180);
  for (let index = 0; index < total; index += 1) {
    const t = (index / total) * Math.PI * 2;
    const hx = 16 * Math.sin(t) ** 3;
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    let x = (hx / 17) * (width / 2);
    let y = ((5 - hy) / 22) * height;
    const angle = Math.atan2(y - centreY, x);
    let notch = 0;
    for (const slit of slits) {
      let diff = Math.abs(angle - slit);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      notch = Math.max(notch, Math.max(0, 1 - diff / 0.1));
    }
    const pull = 1 - notch * 0.62;
    x *= pull;
    y = centreY + (y - centreY) * pull;
    points.push([x, y]);
  }
  const shape = new Shape();
  points.forEach(([x, y], index) => (index === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.025,
    bevelEnabled: false,
    steps: 1,
  });
  geometry.translate(0, 0, -0.0125);
  return geometry;
}

/** Orient something that grows along +Y: face yaw about Y, then tip forward by `tilt` radians. */
export function leafRotation(yaw: number, tilt: number, roll = 0): Vec3 {
  const q = new Quaternion().setFromEuler(new Euler(0, yaw, 0))
    .multiply(new Quaternion().setFromEuler(new Euler(tilt, 0, roll)));
  const euler = new Euler().setFromQuaternion(q);
  return [euler.x, euler.y, euler.z];
}
