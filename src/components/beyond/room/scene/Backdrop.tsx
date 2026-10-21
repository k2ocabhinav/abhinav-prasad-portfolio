"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Group, PerspectiveCamera, PointsMaterial, SpriteMaterial } from "three";
import { useNightBlend } from "./dayNight";
import { cloudTexture, glowTexture } from "./textures";

// The backdrop is pinned to the camera so it always fills the frame whatever the
// aspect ratio. Positions are in screen units: x and y run from -1 to 1.
const DISTANCE = 44;

interface CloudSpec {
  x: number;
  y: number;
  /** Width as a fraction of the half-height of the view. */
  width: number;
  speed: number;
  phase: number;
}

const CLOUDS: CloudSpec[] = [
  { x: -0.9, y: 0.06, width: 0.62, speed: 0.05, phase: 0 },
  { x: 0.9, y: 0.42, width: 0.5, speed: 0.04, phase: 2 },
  { x: -0.92, y: -0.46, width: 0.42, speed: 0.06, phase: 4 },
  { x: 0.62, y: 0.88, width: 0.4, speed: 0.035, phase: 1 },
  { x: 0.94, y: -0.62, width: 0.36, speed: 0.045, phase: 3 },
];

function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/** Flat drifting clouds by day, stars by night, behind the room. */
export function Backdrop() {
  const blend = useNightBlend();
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const cloud = useMemo(() => cloudTexture(), []);
  const glow = useMemo(() => glowTexture(), []);
  const rootRef = useRef<Group>(null);
  const cloudGroup = useRef<Group>(null);
  const starsRef = useRef<Group>(null);
  const starMaterial = useRef<PointsMaterial>(null);
  const cloudMaterials = useRef<(SpriteMaterial | null)[]>([]);
  const stars = useMemo(() => {
    const random = seeded(11);
    const count = 130;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = random() * 2 - 1;
      positions[index * 3 + 1] = random() * 2 - 1;
      positions[index * 3 + 2] = -1;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame(({ clock }) => {
    const root = rootRef.current;
    if (!root) return;
    const night = blend.get();
    const t = clock.elapsedTime;
    root.position.copy(camera.position);
    root.quaternion.copy(camera.quaternion);
    const fov = camera instanceof PerspectiveCamera ? camera.fov : 36;
    const halfHeight = DISTANCE * Math.tan((fov * Math.PI) / 360);
    const halfWidth = halfHeight * (size.width / Math.max(size.height, 1));

    cloudGroup.current?.children.forEach((child, index) => {
      const spec = CLOUDS[index];
      child.position.set(spec.x * halfWidth + Math.sin(t * spec.speed + spec.phase) * 0.9, spec.y * halfHeight, -DISTANCE);
      const width = spec.width * halfHeight;
      child.scale.set(width, width * 0.44, 1);
    });
    starsRef.current?.scale.set(halfWidth, halfHeight, DISTANCE);
    cloudMaterials.current.forEach((material) => {
      if (!material) return;
      material.opacity = 0.92 - night * 0.76;
      material.color.setRGB(1 - night * 0.5, 1 - night * 0.55, 1 - night * 0.1);
    });
    if (starMaterial.current) starMaterial.current.opacity = night * (0.8 + 0.2 * Math.sin(t * 1.4));
  });

  return (
    <group ref={rootRef}>
      <group ref={cloudGroup}>
        {CLOUDS.map((spec, index) => (
          <sprite key={index} renderOrder={-5}>
            <spriteMaterial
              ref={(node) => { cloudMaterials.current[index] = node; }}
              map={cloud}
              transparent
              opacity={0.9}
              depthWrite={false}
              toneMapped={false}
            />
          </sprite>
        ))}
      </group>
      <group ref={starsRef}>
        <points geometry={stars} frustumCulled={false} renderOrder={-5}>
          <pointsMaterial ref={starMaterial} map={glow} color="#FFF3D2" size={3.4} sizeAttenuation={false} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </points>
      </group>
    </group>
  );
}
