"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  AlwaysStencilFunc,
  Color,
  EqualStencilFunc,
  MeshBasicMaterial,
  PointsMaterial,
  ReplaceStencilOp,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
} from "three";
import { useNightBlend } from "./dayNight";
import { fogTexture, glassTexture, glowTexture, moonTexture, useGradientTexture } from "./textures";

// The view through the window: sky, hills, drifting Shillong mist, and at night
// stars, a moon and a few warm house lights. Everything sits behind the wall's
// window opening (x -2.35..2.05, y 2.15..4.45, wall back face z = -2.97).

const SKY_Z = -5.4;

// The view only shows through the wall's window opening: a mask drawn after the wall
// writes stencil 1 inside the hole, and every layer of the view tests against it.
const viewStencil = { stencilWrite: true, stencilRef: 1, stencilFunc: EqualStencilFunc } as const;

interface HillSpec {
  z: number;
  base: number;
  day: string;
  night: string;
  seed: number;
  trees: boolean;
}

const HILLS: HillSpec[] = [
  { z: -4.7, base: 3.4, day: "#B6D7F4", night: "#3E3B88", seed: 1, trees: false },
  { z: -4.35, base: 3.13, day: "#93CDD9", night: "#34317C", seed: 2, trees: false },
  { z: -3.95, base: 2.88, day: "#6DBF93", night: "#2A276C", seed: 3, trees: true },
  { z: -3.55, base: 2.62, day: "#4BAA77", night: "#211E5C", seed: 4, trees: true },
  { z: -3.2, base: 2.36, day: "#379063", night: "#181548", seed: 5, trees: true },
];

interface FogSpec {
  z: number;
  y: number;
  height: number;
  speed: number;
  opacity: number;
  seed: number;
}

const FOG: FogSpec[] = [
  { z: -4.55, y: 3.2, height: 1.7, speed: 0.0045, opacity: 0.85, seed: 1 },
  { z: -4.1, y: 2.95, height: 1.6, speed: -0.007, opacity: 0.9, seed: 2 },
  { z: -3.62, y: 2.7, height: 1.5, speed: 0.011, opacity: 0.95, seed: 3 },
  { z: -3.1, y: 2.42, height: 1.4, speed: -0.016, opacity: 1, seed: 4 },
];

function seeded(seed: number) {
  let value = seed * 9301 + 49297;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function ridge(x: number, spec: HillSpec): number {
  const s = spec.seed;
  return spec.base
    + Math.sin(x * 0.62 + s * 1.9) * 0.27
    + Math.sin(x * 1.37 + s * 0.7) * 0.12
    + Math.sin(x * 2.9 + s * 2.3) * 0.045;
}

function hillGeometry(spec: HillSpec): ShapeGeometry {
  const x0 = -6;
  const x1 = 5;
  const random = seeded(spec.seed * 31);
  const shape = new Shape();
  shape.moveTo(x0, 1.0);
  shape.lineTo(x0, ridge(x0, spec));
  let nextTree = x0 + 0.4;
  for (let x = x0 + 0.1; x <= x1; x += 0.1) {
    const y = ridge(x, spec);
    if (spec.trees && x >= nextTree) {
      const size = 0.14 + random() * 0.13;
      shape.lineTo(x - size * 0.34, y);
      shape.lineTo(x, y + size * 1.9);
      shape.lineTo(x + size * 0.34, y);
      nextTree = x + 0.22 + random() * 0.4;
      x += size * 0.34;
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.lineTo(x1, 1.0);
  shape.closePath();
  return new ShapeGeometry(shape, 1);
}

const SKY_DAY = ["#7FC4FA", "#B5DDFB", "#FFE4C4"];
const SKY_NIGHT = ["#0B0930", "#1C1646", "#43297E"];

function Sky() {
  const blend = useNightBlend();
  const painted = useRef(-1);
  const { texture, paint } = useGradientTexture(128);
  const dayColors = useMemo(() => SKY_DAY.map((hex) => new Color(hex)), []);
  const nightColors = useMemo(() => SKY_NIGHT.map((hex) => new Color(hex)), []);
  const scratch = useMemo(() => new Color(), []);

  useFrame(() => {
    const night = blend.get();
    if (Math.abs(night - painted.current) < 0.002) return;
    painted.current = night;
    paint([0, 0.5, 1].map((stop, index) => {
      scratch.copy(dayColors[index]).lerp(nightColors[index], night);
      return [stop, `#${scratch.getHexString(SRGBColorSpace)}`] as [number, string];
    }));
  });

  return (
    <mesh position={[-0.6, 3.3, SKY_Z]} renderOrder={2}>
      <planeGeometry args={[26, 8.2]} />
      <meshBasicMaterial map={texture} toneMapped={false} {...viewStencil} />
    </mesh>
  );
}

function SunAndMoon() {
  const blend = useNightBlend();
  const glow = useMemo(() => glowTexture(), []);
  const moon = useMemo(() => moonTexture(), []);
  const sunRef = useRef<MeshBasicMaterial>(null);
  const moonRef = useRef<MeshBasicMaterial>(null);

  useFrame(() => {
    const night = blend.get();
    if (sunRef.current) sunRef.current.opacity = (1 - night) * 0.55;
    if (moonRef.current) moonRef.current.opacity = night;
  });

  return (
    <group>
      <mesh position={[-1.5, 3.9, SKY_Z + 0.1]} renderOrder={2}>
        <planeGeometry args={[4.2, 4.2]} />
        <meshBasicMaterial ref={sunRef} map={glow} color="#FFE9A8" transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} {...viewStencil} />
      </mesh>
      <mesh position={[-0.4, 3.85, SKY_Z + 0.1]} renderOrder={2}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial ref={moonRef} map={moon} transparent opacity={0} depthWrite={false} toneMapped={false} {...viewStencil} />
      </mesh>
    </group>
  );
}

function Stars() {
  const blend = useNightBlend();
  const glow = useMemo(() => glowTexture(), []);
  const materialRef = useRef<PointsMaterial>(null);
  const geometry = useMemo(() => {
    const random = seeded(7);
    const count = 90;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = -6 + random() * 11;
      positions[index * 3 + 1] = 2.9 + random() * 2.8;
      positions[index * 3 + 2] = SKY_Z + 0.3;
    }
    const result = new BufferGeometry();
    result.setAttribute("position", new BufferAttribute(positions, 3));
    return result;
  }, []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.opacity = blend.get() * (0.78 + 0.22 * Math.sin(clock.elapsedTime * 1.6));
    }
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial ref={materialRef} map={glow} color="#FFF6D8" size={3.2} sizeAttenuation={false} transparent opacity={0} depthWrite={false} toneMapped={false} {...viewStencil} />
    </points>
  );
}

function Hills() {
  const blend = useNightBlend();
  const materials = useRef<(MeshBasicMaterial | null)[]>([]);
  const geometries = useMemo(() => HILLS.map((spec) => hillGeometry(spec)), []);
  const dayColors = useMemo(() => HILLS.map((spec) => new Color(spec.day)), []);
  const nightColors = useMemo(() => HILLS.map((spec) => new Color(spec.night)), []);

  useFrame(() => {
    const night = blend.get();
    materials.current.forEach((material, index) => {
      material?.color.copy(dayColors[index]).lerp(nightColors[index], night);
    });
  });

  return (
    <group>
      {HILLS.map((spec, index) => (
        <mesh key={spec.seed} geometry={geometries[index]} position={[0, 0, spec.z]} renderOrder={2}>
          <meshBasicMaterial ref={(node) => { materials.current[index] = node; }} color={spec.day} toneMapped={false} {...viewStencil} />
        </mesh>
      ))}
    </group>
  );
}

function HouseLights() {
  const blend = useNightBlend();
  const glow = useMemo(() => glowTexture(), []);
  const materialRef = useRef<PointsMaterial>(null);
  const geometry = useMemo(() => {
    const random = seeded(23);
    const list: number[] = [];
    const place = (spec: HillSpec, xs: number[]) => {
      for (const x of xs) list.push(x, ridge(x, spec) - 0.08 - random() * 0.2, spec.z + 0.04);
    };
    place(HILLS[2], [-2.4, -1.6, -0.5, 0.3, 1.3, 2.3]);
    place(HILLS[3], [-1.9, -1.1, 0.0, 0.9, 1.7]);
    place(HILLS[4], [-2.1, -0.8, 0.6, 1.4]);
    const result = new BufferGeometry();
    result.setAttribute("position", new BufferAttribute(new Float32Array(list), 3));
    return result;
  }, []);

  useFrame(({ clock }) => {
    if (materialRef.current) materialRef.current.opacity = blend.get() * (0.88 + 0.12 * Math.sin(clock.elapsedTime * 0.9));
  });

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={2}>
      <pointsMaterial ref={materialRef} map={glow} color="#FFC96B" size={9} sizeAttenuation={false} transparent opacity={0} depthWrite={false} blending={AdditiveBlending} toneMapped={false} {...viewStencil} />
    </points>
  );
}

function FogBands() {
  const blend = useNightBlend();
  const materials = useRef<(MeshBasicMaterial | null)[]>([]);
  const textures = useMemo(() => FOG.map((spec) => {
    const texture = fogTexture(spec.seed).clone();
    texture.needsUpdate = true;
    texture.repeat.set(3, 1);
    return texture;
  }), []);
  const dayColor = useMemo(() => new Color("#FFF5E8"), []);
  const nightColor = useMemo(() => new Color("#8A86D8"), []);

  useFrame(({ clock }) => {
    const night = blend.get();
    FOG.forEach((spec, index) => {
      textures[index].offset.x = (clock.elapsedTime * spec.speed + spec.seed * 0.23) % 1;
      const material = materials.current[index];
      if (material) {
        material.color.copy(dayColor).lerp(nightColor, night);
        material.opacity = spec.opacity * (1 - night * 0.45);
      }
    });
  });

  return (
    <group>
      {FOG.map((spec, index) => (
        <mesh key={spec.seed} position={[-0.6, spec.y, spec.z]} renderOrder={1}>
          <planeGeometry args={[14, spec.height]} />
          <meshBasicMaterial
            ref={(node) => { materials.current[index] = node; }}
            map={textures[index]}
            transparent
            opacity={spec.opacity}
            depthWrite={false}
            toneMapped={false}
            {...viewStencil}
          />
        </mesh>
      ))}
    </group>
  );
}

function Glass() {
  const blend = useNightBlend();
  const texture = useMemo(() => glassTexture(), []);
  const materialRef = useRef<MeshBasicMaterial>(null);
  useFrame(() => {
    if (materialRef.current) materialRef.current.opacity = 0.85 - blend.get() * 0.45;
  });
  return (
    <mesh position={[-0.15, 3.3, -2.8]} renderOrder={5}>
      <planeGeometry args={[4.4, 2.3]} />
      <meshBasicMaterial ref={materialRef} map={texture} transparent opacity={0.85} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function WindowMask() {
  return (
    <mesh position={[-0.15, 3.3, -2.9]} renderOrder={1}>
      <planeGeometry args={[4.8, 2.7]} />
      <meshBasicMaterial colorWrite={false} depthWrite={false} stencilWrite stencilRef={1} stencilFunc={AlwaysStencilFunc} stencilZPass={ReplaceStencilOp} />
    </mesh>
  );
}

export function WindowView() {
  return (
    <group>
      <WindowMask />
      <Sky />
      <SunAndMoon />
      <Stars />
      <Hills />
      <HouseLights />
      <FogBands />
      <Glass />
    </group>
  );
}
