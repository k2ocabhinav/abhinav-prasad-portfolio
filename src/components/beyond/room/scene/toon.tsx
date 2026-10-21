"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  Euler,
  LatheGeometry,
  Material,
  Matrix4,
  MeshToonMaterial,
  PerspectiveCamera,
  Quaternion,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Vec3 } from "../contracts";
import { roomPalette } from "../contracts";
import { toonRamp } from "./toonRamp";

/** Outline weight in screen pixels; every object shares it. */
const OUTLINE_PIXELS = 2.1;

export const outlineUniforms = {
  uThickness: { value: 0.018 },
  uColor: { value: new Color(roomPalette.ink) },
};

let sharedToonMaterial: MeshToonMaterial | null = null;
let sharedOutlineMaterial: ShaderMaterial | null = null;

/** Vertex-coloured toon material shared by every static piece. */
export function getToonMaterial(): MeshToonMaterial {
  sharedToonMaterial ??= new MeshToonMaterial({ vertexColors: true, gradientMap: toonRamp });
  return sharedToonMaterial;
}

/** Inverted-hull material: back faces pushed out along the welded normal. */
export function getOutlineMaterial(): ShaderMaterial {
  sharedOutlineMaterial ??= new ShaderMaterial({
    uniforms: outlineUniforms,
    side: BackSide,
    vertexShader: /* glsl */ `
      uniform float uThickness;
      attribute vec3 outlineNormal;
      void main() {
        vec3 p = position + outlineNormal * uThickness;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      void main() {
        gl_FragColor = vec4(uColor, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
  return sharedOutlineMaterial;
}

/** The point the camera is looking at; the ink weight is measured at this distance. */
export const outlineFocus = new Vector3(0, 2.2, 0);

/** Keeps the outline a constant number of pixels wide whatever the framing. */
export function OutlineScaler() {
  const camera = useThree((state) => state.camera);
  const height = useThree((state) => state.size.height);
  useFrame(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const distance = camera.position.distanceTo(outlineFocus);
    const worldPerPixel = (2 * distance * Math.tan((camera.fov * Math.PI) / 360)) / Math.max(height, 1);
    outlineUniforms.uThickness.value = worldPerPixel * OUTLINE_PIXELS;
  });
  return null;
}

// ---------------------------------------------------------------------------
// Geometry helpers

/** A box with softly rounded edges and smooth normals. `bevel` = segments per corner arc. */
export function roundedBox(width: number, height: number, depth: number, radius = 0.05, bevel = 1): BufferGeometry {
  const r = Math.max(0.002, Math.min(radius, width / 2 - 0.002, height / 2 - 0.002, depth / 2 - 0.002));
  const half: Vec3 = [width / 2, height / 2, depth / 2];
  const inner: Vec3 = [half[0] - r, half[1] - r, half[2] - r];
  const values = (axis: number) => {
    const list: number[] = [];
    for (let k = bevel; k >= 0; k -= 1) list.push(-(inner[axis] + (r * k) / bevel));
    for (let k = 0; k <= bevel; k += 1) list.push(inner[axis] + (r * k) / bevel);
    return list;
  };
  const axisValues = [values(0), values(1), values(2)];
  // [fixed axis, sign, u axis, v axis] where u x v points along sign * fixed axis.
  const faces: [number, number, number, number][] = [
    [0, 1, 1, 2], [0, -1, 2, 1],
    [1, 1, 2, 0], [1, -1, 0, 2],
    [2, 1, 0, 1], [2, -1, 1, 0],
  ];
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const virtual: Vec3 = [0, 0, 0];

  for (const [fixed, sign, uAxis, vAxis] of faces) {
    const base = positions.length / 3;
    const us = axisValues[uAxis];
    const vs = axisValues[vAxis];
    for (let j = 0; j < vs.length; j += 1) {
      for (let i = 0; i < us.length; i += 1) {
        virtual[fixed] = sign * half[fixed];
        virtual[uAxis] = us[i];
        virtual[vAxis] = vs[j];
        const out: Vec3 = [0, 0, 0];
        const dir: Vec3 = [0, 0, 0];
        let length = 0;
        for (let a = 0; a < 3; a += 1) {
          const clamped = Math.max(-inner[a], Math.min(inner[a], virtual[a]));
          dir[a] = virtual[a] - clamped;
          out[a] = clamped;
          length += dir[a] * dir[a];
        }
        length = Math.sqrt(length) || 1;
        for (let a = 0; a < 3; a += 1) {
          dir[a] /= length;
          positions.push(out[a] + dir[a] * r);
          normals.push(dir[a]);
        }
      }
    }
    const columns = us.length;
    for (let j = 0; j < vs.length - 1; j += 1) {
      for (let i = 0; i < columns - 1; i += 1) {
        const a = base + j * columns + i;
        const b = a + 1;
        const c = b + columns;
        const d = a + columns;
        indices.push(a, b, c, a, c, d);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute("normal", new BufferAttribute(new Float32Array(normals), 3));
  geometry.setIndex(indices);
  return geometry;
}

/** Solid of revolution from [radius, y] points, bottom to top. */
export function lathe(profile: [number, number][], segments = 14): BufferGeometry {
  return new LatheGeometry(profile.map(([x, y]) => new Vector2(x, y)), segments);
}

/** A chunky cylinder with rounded rims, base at y=0. */
export function pill(radiusBottom: number, radiusTop: number, height: number, round = 0.03, segments = 14): BufferGeometry {
  const rb = Math.max(round, radiusBottom);
  const rt = Math.max(round, radiusTop);
  return lathe([
    [0, 0],
    [rb - round, 0],
    [rb - round * 0.3, round * 0.3],
    [rb, round],
    [rt, height - round],
    [rt - round * 0.3, height - round * 0.3],
    [rt - round, height],
    [0, height],
  ], segments);
}

// ---------------------------------------------------------------------------
// Merging into vertex-coloured geometry with welded outline normals

export interface Part {
  geometry: BufferGeometry;
  color: string;
  position?: Vec3;
  rotation?: Vec3;
  scale?: Vec3;
  /** Draw an ink outline around this part (default true). */
  outline?: boolean;
}

const scratchMatrix = new Matrix4();
const scratchQuaternion = new Quaternion();
const scratchEuler = new Euler();
const scratchPosition = new Vector3();
const scratchScale = new Vector3();
const scratchColor = new Color();

/**
 * One outline direction per position: the miter of the distinct surface normals that
 * meet there, so a flat box and a smooth curve get the same ink weight.
 */
function weldedNormals(geometry: BufferGeometry): Float32Array {
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const groups = new Map<string, Vector3[]>();
  const keys: string[] = [];
  for (let index = 0; index < position.count; index += 1) {
    const key = `${Math.round(position.getX(index) * 2000)}|${Math.round(position.getY(index) * 2000)}|${Math.round(position.getZ(index) * 2000)}`;
    keys.push(key);
    const list = groups.get(key) ?? [];
    const candidate = new Vector3(normal.getX(index), normal.getY(index), normal.getZ(index)).normalize();
    if (!list.some((existing) => existing.dot(candidate) > 0.97)) list.push(candidate);
    groups.set(key, list);
  }
  const resolved = new Map<string, Vector3>();
  for (const [key, list] of groups) {
    const sum = new Vector3();
    for (const entry of list) sum.add(entry);
    const lengthSquared = sum.lengthSq();
    if (lengthSquared < 1e-6) {
      resolved.set(key, list[0].clone());
      continue;
    }
    sum.multiplyScalar(list.length / lengthSquared);
    if (sum.length() > 1.7) sum.setLength(1.7);
    resolved.set(key, sum);
  }
  const result = new Float32Array(position.count * 3);
  keys.forEach((key, index) => {
    const value = resolved.get(key) as Vector3;
    result[index * 3] = value.x;
    result[index * 3 + 1] = value.y;
    result[index * 3 + 2] = value.z;
  });
  return result;
}

function bake(part: Part): BufferGeometry {
  let geometry = part.geometry.clone();
  if (geometry.index) geometry = geometry.toNonIndexed();
  for (const name of Object.keys(geometry.attributes)) {
    if (name !== "position" && name !== "normal") geometry.deleteAttribute(name);
  }
  scratchEuler.set(...(part.rotation ?? [0, 0, 0]));
  scratchQuaternion.setFromEuler(scratchEuler);
  scratchPosition.set(...(part.position ?? [0, 0, 0]));
  scratchScale.set(...(part.scale ?? [1, 1, 1]));
  scratchMatrix.compose(scratchPosition, scratchQuaternion, scratchScale);
  geometry.applyMatrix4(scratchMatrix);

  const count = geometry.getAttribute("position").count;
  scratchColor.set(part.color);
  const colors = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    colors[index * 3] = scratchColor.r;
    colors[index * 3 + 1] = scratchColor.g;
    colors[index * 3 + 2] = scratchColor.b;
  }
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  geometry.setAttribute("outlineNormal", new BufferAttribute(weldedNormals(geometry), 3));
  return geometry;
}

export interface ToonGeometry {
  body: BufferGeometry;
  hull: BufferGeometry | null;
}

export function mergeParts(parts: Part[]): ToonGeometry {
  const baked = parts.map((part) => ({ geometry: bake(part), outline: part.outline !== false }));
  const body = mergeGeometries(baked.map((entry) => entry.geometry), false);
  const outlined = baked.filter((entry) => entry.outline).map((entry) => entry.geometry);
  let hull: BufferGeometry | null = null;
  if (outlined.length > 0) {
    hull = mergeGeometries(outlined, false);
    hull.deleteAttribute("normal");
    hull.deleteAttribute("color");
  }
  for (const entry of baked) entry.geometry.dispose();
  return { body, hull };
}

const noRaycast = () => null;

interface ToonProps {
  parts: Part[];
  position?: Vec3;
  rotation?: Vec3;
  /** Override the shared vertex-colour material (e.g. for an animated emissive). */
  material?: Material;
  children?: ReactNode;
}

/** A merged, outlined toon object: one draw call for the body, one for the ink. */
export function Toon({ parts, position, rotation, material, children }: ToonProps) {
  const geometry = useMemo(() => mergeParts(parts), [parts]);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry.body} material={material ?? getToonMaterial()} />
      {geometry.hull ? <mesh geometry={geometry.hull} material={getOutlineMaterial()} raycast={noRaycast} /> : null}
      {children}
    </group>
  );
}
