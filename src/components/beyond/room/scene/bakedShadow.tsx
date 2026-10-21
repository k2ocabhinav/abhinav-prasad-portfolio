"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { MeshBasicMaterial } from "three";
import { useNightBlend } from "./dayNight";
import { shadowTexture } from "./textures";

/** Soft ground shadow under the diorama, drawn once as a baked texture. */
export function BakedShadow() {
  const blend = useNightBlend();
  const texture = useMemo(() => shadowTexture(), []);
  const materialRef = useRef<MeshBasicMaterial>(null);

  useFrame(() => {
    if (materialRef.current) materialRef.current.opacity = 0.42 + blend.get() * 0.2;
  });

  return (
    <mesh position={[0.2, -0.82, 0.1]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[15, 11.2]} />
      <meshBasicMaterial ref={materialRef} map={texture} transparent opacity={0.42} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
