"use client";

import { Outlines } from "@react-three/drei/core/Outlines";
import { RoundedBox } from "@react-three/drei/core/RoundedBox";
import { useLayoutEffect, useMemo, useRef } from "react";
import { BoxGeometry, InstancedMesh, MeshToonMaterial, Object3D } from "three";
import type { Vec3 } from "../contracts";
import { roomPalette } from "../contracts";
import { toonRamp } from "./toonRamp";

interface InkBoxProps {
  position: Vec3;
  size: Vec3;
  color: string;
  rotation?: Vec3;
  radius?: number;
  outlined?: boolean;
}

export function InkBox({
  position,
  size,
  color,
  rotation = [0, 0, 0],
  radius = 0.045,
  outlined = false,
}: InkBoxProps) {
  return (
    <RoundedBox
      position={position}
      rotation={rotation}
      args={size}
      radius={radius}
      smoothness={1}
      bevelSegments={1}
      castShadow={false}
      receiveShadow={false}
    >
      <meshToonMaterial color={color} gradientMap={toonRamp} />
      {outlined ? (
        <Outlines color={roomPalette.ink} thickness={0.022} angle={0} />
      ) : null}
    </RoundedBox>
  );
}

export interface BoxInstance {
  position: Vec3;
  size: Vec3;
  rotation?: Vec3;
}

interface InstancedBoxesProps {
  instances: BoxInstance[];
  color: string;
  outlined?: boolean;
}

export function InstancedBoxes({ instances, color, outlined = false }: InstancedBoxesProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const transform = useMemo(() => new Object3D(), []);
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const material = useMemo(
    () => new MeshToonMaterial({ color, gradientMap: toonRamp }),
    [color],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    instances.forEach(({ position, size, rotation = [0, 0, 0] }, index) => {
      transform.position.set(...position);
      transform.rotation.set(...rotation);
      transform.scale.set(...size);
      transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [instances, transform]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, instances.length]}
      castShadow={false}
      receiveShadow={false}
    >
      {outlined ? <Outlines color={roomPalette.ink} thickness={0.022} angle={0} /> : null}
    </instancedMesh>
  );
}
